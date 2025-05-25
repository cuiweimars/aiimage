import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { creemClient } from "@/lib/creem"

export async function POST(req: NextRequest) {
  try {
    // Paddle暂不支持自助客户门户，直接返回错误或引导联系客服。
    return NextResponse.json({ error: "Paddle暂不支持自助客户门户，请联系客服处理订阅。" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create customer portal" }, { status: 500 })
  }
}
