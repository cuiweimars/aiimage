import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const paddleRes = await fetch('https://api.paddle.com/prices', {
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
        'Paddle-Version': '2023-10-01'
      }
    })
    const data = await paddleRes.json()
    if (!data?.data) {
      return NextResponse.json({ error: 'Failed to fetch Paddle prices' }, { status: 500 })
    }
    // 假设 Paddle 返回的价格数据格式为 { data: [{ id: 'pri_xxx', unit_amount: 1000, ... }, ...] }
    const prices: any = {}
    data.data.forEach((price: any) => {
      const key = price.id
      prices[key] = price.unit_amount ? price.unit_amount / 100 : null
    })
    return NextResponse.json(prices)
  } catch (error) {
    console.error("Paddle pricing error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch prices" }, { status: 500 })
  }
} 