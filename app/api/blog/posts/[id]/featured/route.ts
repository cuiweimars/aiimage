import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// 更新博客文章特色状态
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

    const { featured } = await req.json()

    if (typeof featured !== "boolean") {
      return NextResponse.json({ error: "Featured status must be a boolean" }, { status: 400 })
    }

    const supabase = createClient()

    // 如果要将文章设为特色，先将所有文章的特色状态设为false
    if (featured) {
      await supabase.from("blog_posts").update({ featured: false }).eq("featured", true)
    }

    // 更新文章特色状态
    const { data: updatedPost, error } = await supabase
      .from("blog_posts")
      .update({
        featured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .select()
      .single()

    if (error) {
      console.error("Error updating blog post featured status:", error)
      return NextResponse.json({ error: "Failed to update blog post featured status" }, { status: 500 })
    }

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("Error in PATCH /api/blog/posts/[id]/featured:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
