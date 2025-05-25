import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// 删除博客分类
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const categoryId = params.id

    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // 检查是否有使用此分类的文章
    const { count, error: countError } = await supabase
      .from("blog_posts")
      .select("*", { count: "exact" })
      .eq("category", categoryId)

    if (countError) {
      console.error("Error checking category usage:", countError)
      return NextResponse.json({ error: "Failed to check category usage" }, { status: 500 })
    }

    if (count && count > 0) {
      return NextResponse.json({ error: "Cannot delete category that is being used by blog posts" }, { status: 400 })
    }

    // 删除分类
    const { error } = await supabase.from("blog_categories").delete().eq("id", categoryId)

    if (error) {
      console.error("Error deleting blog category:", error)
      return NextResponse.json({ error: "Failed to delete blog category" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/blog/categories/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// 更新博客分类
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const categoryId = params.id

    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
    }

    const { name, slug } = await req.json()

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    const supabase = createClient()

    // 检查slug是否已被其他分类使用
    const { data: existingCategory } = await supabase
      .from("blog_categories")
      .select()
      .eq("slug", slug)
      .neq("id", categoryId)
      .single()

    if (existingCategory) {
      return NextResponse.json({ error: "Category with this slug already exists" }, { status: 409 })
    }

    // 更新分类
    const { data: updatedCategory, error } = await supabase
      .from("blog_categories")
      .update({
        name,
        slug,
      })
      .eq("id", categoryId)
      .select()
      .single()

    if (error) {
      console.error("Error updating blog category:", error)
      return NextResponse.json({ error: "Failed to update blog category" }, { status: 500 })
    }

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("Error in PATCH /api/blog/categories/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
