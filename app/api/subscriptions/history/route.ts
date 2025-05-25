import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const supabase = createClient()

    // 获取用户订阅历史
    // Get user subscription history
    const { data, error } = await supabase
      .from("subscription_history")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Error fetching subscription history:", error)
      return NextResponse.json({ error: "Failed to fetch subscription history" }, { status: 500 })
    }

    return NextResponse.json({ history: data })
  } catch (error) {
    console.error("Error fetching subscription history:", error)
    return NextResponse.json({ error: "Failed to fetch subscription history" }, { status: 500 })
  }
}
