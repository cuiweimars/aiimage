import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 验证Stripe Webhook签名
async function verifyStripeWebhook(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    throw new Error('No signature found')
  }

  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    throw new Error(`Webhook signature verification failed: ${error.message}`)
  }
}

export async function POST(req: Request) {
  try {
    const event = await verifyStripeWebhook(req)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // 更新用户订阅状态
        const { error } = await supabase
          .from('users')
          .update({
            plan: session.metadata?.plan || 'basic',
            subscription_status: 'active',
            subscription_expiry: new Date(
              Date.now() + (session.metadata?.interval === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000
            ).toISOString(),
          })
          .eq('id', session.metadata?.userId)

        if (error) {
          console.error('Failed to update user subscription:', error)
          throw error
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_end: number
        }
        
        // 更新订阅状态
        if (subscription.status === 'active') {
          const { error } = await supabase
            .from('users')
            .update({
              subscription_status: 'active',
              subscription_expiry: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_customer_id', subscription.customer)

          if (error) {
            console.error('Failed to update subscription status:', error)
            throw error
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // 处理订阅取消
        const { error } = await supabase
          .from('users')
          .update({
            plan: 'guest',
            subscription_status: 'canceled',
            subscription_expiry: null,
          })
          .eq('stripe_customer_id', subscription.customer)

        if (error) {
          console.error('Failed to cancel subscription:', error)
          throw error
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
} 