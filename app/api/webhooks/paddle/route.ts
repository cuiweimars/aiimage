import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verifyWebhookSignature } from '@/lib/paddle'
import { createClient } from "@/lib/supabase/server"
import { PADDLE_WEBHOOK_SECRET } from '@/lib/config'

// 允许的 Paddle IP 地址
const allowedIps = [
  '134.194.127.46',
  '254.234.237.108',
  '33.208.120.145',
  '444.226.236.210',
  '544.241.183.62',
  '6100.20.172.113'
]

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // 移除配额检查逻辑
  // let quotaCheck = null
  // if (session?.user?.id) {
  //   quotaCheck = await getUserQuotaUsage(session.user.id)
  //   if (!quotaCheck?.success || !quotaCheck?.quota?.remaining || quotaCheck.quota.remaining <= 0) {
  //     return NextResponse.json(
  //       {
  //         error: 'Quota exceeded'
  //       },
  //       { status: 403 }
  //     )
  //   }
  // }

  // 检查 IP 地址
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
  if (!clientIp || !allowedIps.includes(clientIp)) {
    console.error(`IP not allowed: ${clientIp}`)
    return new Response('IP not allowed', { status: 403 })
  }

  // 检查签名
  const headersList = headers()
  const signature = headersList.get('paddle-signature')
  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  const rawBody = await req.text()
  const isValid = verifyWebhookSignature(rawBody, signature, process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET!)
  if (!isValid) {
    return new Response('Invalid signature', { status: 400 })
  }

  const payload = JSON.parse(rawBody)

  // 异步处理 webhook 逻辑
  const processWebhook = async (payload: any) => {
    const event = payload.event_type
    switch (event) {
      case 'subscription.created':
      case 'subscription.updated': {
        const { customer, items, status, id, current_period_end } = payload.data
        const plan = items?.[0]?.price_id || ''
        const { data: user } = await supabase.from('users').select('id').eq('email', customer.email).single()
        if (user) {
          await supabase.from('subscriptions').upsert({
            user_id: user.id,
            paddle_subscription_id: id,
            paddle_customer_id: customer.id,
            plan,
            status,
            current_period_end: new Date(current_period_end).toISOString(),
            updated_at: new Date().toISOString(),
            items
          }, { onConflict: 'user_id' })
          // 同步更新用户表的plan字段
          await supabase.from('users').update({ plan }).eq('id', user.id)
          // 写入订阅历史
          await supabase.from('subscription_history').insert({
            user_id: user.id,
            subscription_id: id,
            plan,
            status,
            event_type: event,
          })
        }
        break
      }
      case 'subscription.cancelled': {
        const { id } = payload.data
        const { data: sub } = await supabase.from('subscriptions').select('user_id').eq('paddle_subscription_id', id).single()
        if (sub) {
          await supabase.from('subscriptions').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('user_id', sub.user_id)
          await supabase.from('subscription_history').insert({
            user_id: sub.user_id,
            subscription_id: id,
            plan: '',
            status: 'cancelled',
            event_type: event,
          })
        }
        break
      }
      default:
        console.log(`Unhandled Paddle event: ${event}`)
    }
  }

  // 设置超时，确保在 5 秒内返回 200 状态码
  const timeout = setTimeout(() => {
    return new Response('Timeout', { status: 408 })
  }, 5000)

  try {
    await processWebhook(payload)
    clearTimeout(timeout)
    return new Response('Webhook processed', { status: 200 })
  } catch (error) {
    clearTimeout(timeout)
    return new Response('Internal Server Error', { status: 500 })
  }
} 