import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { config } from "@/lib/config"

// 验证 webhook 签名
// Verify webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const crypto = require("crypto")
  const hmac = crypto.createHmac("sha256", secret)
  const digest = hmac.update(payload).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

export async function POST(req: NextRequest) {
  try {
    const event = await req.json()
    const supabase = createClient()
    switch (event.type) {
      case "subscription_created":
      case "subscription_updated": {
        const userId = event.data.customer.id // Paddle事件结构
        if (!userId) {
          return NextResponse.json({ error: "User ID not found" }, { status: 400 })
        }
        await supabase.from("subscriptions").upsert({
            id: event.data.id,
          user_id: userId,
          plan: event.data.items[0]?.price_id,
          status: event.data.status,
          current_period_end: event.data.current_period_end,
            updated_at: new Date().toISOString(),
        }, { onConflict: "id" })
        break
      }
      case "subscription_cancelled": {
        const userId = event.data.customer.id
        await supabase.from("subscriptions").update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        }).eq("user_id", userId)
        break
      }
      default:
        break
    }
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Paddle webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
