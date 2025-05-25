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

    // 获取用户基本信息
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
    }

    // 获取用户最新订阅信息
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (subscriptionError && subscriptionError.code !== "PGRST116") {
      console.error("Error fetching subscription:", subscriptionError)
    }

    return NextResponse.json({
      ...user,
      subscription: subscription || null
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 