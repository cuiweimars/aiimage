import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'

// 初始化Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// 订阅计划配置
const PLANS = {
  basic: {
    month: {
      priceId: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
      amount: 9.9,
    },
    year: {
      priceId: process.env.STRIPE_BASIC_YEARLY_PRICE_ID,
      amount: 7.9,
    },
  },
  pro: {
    month: {
      priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      amount: 12.9,
    },
    year: {
      priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
      amount: 9.9,
    },
  },
}

export async function POST(req: Request) {
  try {
    // 验证用户会话
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 解析请求体
    const { plan, interval } = await req.json()
    
    // 验证参数
    if (!plan || !interval || !PLANS[plan as keyof typeof PLANS]?.[interval as 'month'|'year']) {
      return NextResponse.json({ error: 'Invalid plan or interval' }, { status: 400 })
    }

    // 获取价格ID
    const priceId = PLANS[plan as keyof typeof PLANS][interval as 'month'|'year'].priceId
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 })
    }

    // 创建结账会话
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe?canceled=true`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        plan,
        interval,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
} 