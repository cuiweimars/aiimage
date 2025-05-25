import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    const { planId, billingCycle } = await req.json()
    if (!planId || !billingCycle || !["month", "year"].includes(billingCycle)) {
      return NextResponse.json({ error: "Invalid plan ID or billing cycle" }, { status: 400 })
    }
    // 用 Paddle API 创建 checkout session
    const paddleBody = {
      customer: { email: session.user.email },
      items: [{ price_id: planId }],
      success_url: 'https://abcd1234.ngrok.io/zh/subscribe?success=true',
      cancel_url: 'https://abcd1234.ngrok.io/zh/subscribe?canceled=true'
    }
    console.log('Paddle checkout request:', paddleBody)
    const paddleRes = await fetch('https://sandbox-api.paddle.com/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paddleBody)
    })
    const data = await paddleRes.json()
    console.error('Paddle API response:', data)
    if (!data?.data?.checkout?.url) {
      return NextResponse.json({ error: 'Failed to create Paddle checkout session', detail: data }, { status: 500 })
    }
    return NextResponse.json({ url: data.data.checkout.url })
  } catch (error) {
    console.error("Paddle checkout error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create checkout session" }, { status: 500 })
  }
}
