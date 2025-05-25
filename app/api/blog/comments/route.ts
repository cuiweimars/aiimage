import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// 获取博客文章评论
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // 获取已批准的评论
    const { data: comments, error } = await supabase
      .from("blog_comments")
      .select("id, author_name, content, created_at")
      .eq("post_id", postId)
      .eq("status", "approved")
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching comments:", error)
      return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
    }

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error in GET /api/blog/comments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// 创建新评论
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { postId, authorName, authorEmail, content, userId } = await req.json()

    if (!postId || !authorName || !authorEmail || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient()

    // 验证博客文章是否存在
    const { data: post, error: postError } = await supabase.from("blog_posts").select("id").eq("id", postId).single()

    if (postError || !post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }

    // 确定评论状态（已登录用户的评论自动批准）
    const status = session ? "approved" : "pending"

    // 创建评论
    const { data: comment, error } = await supabase
      .from("blog_comments")
      .insert({
        post_id: postId,
        user_id: userId || null,
        author_name: authorName,
        author_email: authorEmail,
        content,
        status,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating comment:", error)
      return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
    }

    // 如果评论需要审核，返回202状态码
    if (status === "pending") {
      return NextResponse.json({ message: "Comment submitted successfully and awaiting approval" }, { status: 202 })
    }

    // 如果评论已自动批准，返回201状态码和评论数据
    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/blog/comments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
