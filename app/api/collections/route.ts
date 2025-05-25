import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// 创建新集合
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { name } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Collection name is required" }, { status: 400 })
    }

    const supabase = createClient()

    // 创建集合
    const { data: collection, error } = await supabase
      .from("collections")
      .insert({
        name,
        user_id: session.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating collection:", error)
      return NextResponse.json({ error: "Failed to create collection" }, { status: 500 })
    }

    return NextResponse.json(collection, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/collections:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
