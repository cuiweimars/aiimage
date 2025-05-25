import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15" })

// 价格ID映射
const PRICE_IDS: Record<string, Record<string, string>> = {
  basic: {
    month: "prod_SL0mEHswxDYedh", // 替换为你的真实price_id
    year: "prod_SL0ofSTHOVIZak"
  },
  pro: {
    month: "prod_SL0o3mLLk5YWlR",
    year: "prod_SL0pgY2DH3yk8X"
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    const { plan, interval } = await req.json()
    if (!plan || !interval || !PRICE_IDS[plan]?.[interval]) {
      return NextResponse.json({ error: "Invalid plan or interval" }, { status: 400 })
    }
    const priceId = PRICE_IDS[plan][interval]
    // 创建Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      customer_email: session.user.email!,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe/cancel`,
      metadata: {
        userId: session.user.id,
        plan,
        interval
      }
    })
    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error("Stripe checkout error", err)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
} 