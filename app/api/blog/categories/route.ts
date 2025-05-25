import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// 创建博客分类
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { name, slug } = await req.json()

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    const supabase = createClient()

    // 检查slug是否已存在
    const { data: existingCategory } = await supabase.from("blog_categories").select().eq("slug", slug).single()

    if (existingCategory) {
      return NextResponse.json({ error: "Category with this slug already exists" }, { status: 409 })
    }

    // 创建分类
    const { data: newCategory, error } = await supabase
      .from("blog_categories")
      .insert({
        name,
        slug,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating blog category:", error)
      return NextResponse.json({ error: "Failed to create blog category" }, { status: 500 })
    }

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/blog/categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
