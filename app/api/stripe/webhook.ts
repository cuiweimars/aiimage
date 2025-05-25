import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15" })
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") as string
  const rawBody = await req.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret)
  } catch (err) {
    console.error("Webhook signature verification failed.", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // 创建Supabase客户端
  const supabase = createClient()

  // 处理不同事件
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan
      const subscriptionId = session.subscription as string
      if (userId && plan && subscriptionId) {
        await supabase.from("users").update({
          plan,
          subscription_id: subscriptionId,
          subscription_status: "active"
        }).eq("id", userId)
      }
      break
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription
      const status = subscription.status
      const subscriptionId = subscription.id
      // 反查用户
      const { data: user } = await supabase.from("users").select("id").eq("subscription_id", subscriptionId).single()
      if (user) {
        await supabase.from("users").update({
          subscription_status: status,
          subscription_expiry: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null
        }).eq("id", user.id)
      }
      break
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      const subscriptionId = subscription.id
      // 反查用户
      const { data: user } = await supabase.from("users").select("id").eq("subscription_id", subscriptionId).single()
      if (user) {
        await supabase.from("users").update({
          plan: "guest",
          subscription_status: "canceled"
        }).eq("id", user.id)
      }
      break
    }
    // 可扩展处理invoice.paid、charge.refunded等
    default:
      break
  }
  return NextResponse.json({ received: true })
} 