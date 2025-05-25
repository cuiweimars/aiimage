import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// 删除博客文章
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // 在实际应用中，您应该检查用户是否有权限删除文章
    // 这里我们简单地假设所有登录用户都是管理员

    const postId = params.id

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // 删除文章
    const { error } = await supabase.from("blog_posts").delete().eq("id", postId)

    if (error) {
      console.error("Error deleting blog post:", error)
      return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/blog/posts/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// 更新博客文章
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const postId = params.id

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    const data = await req.json()

    const supabase = createClient()

    // 更新文章
    const { data: updatedPost, error } = await supabase
      .from("blog_posts")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .select()
      .single()

    if (error) {
      console.error("Error updating blog post:", error)
      return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 })
    }

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("Error in PATCH /api/blog/posts/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
