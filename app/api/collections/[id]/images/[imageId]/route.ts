import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// 从集合中移除图像
export async function DELETE(req: NextRequest, { params }: { params: { id: string; imageId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id: collectionId, imageId } = params

    if (!collectionId || !imageId) {
      return NextResponse.json({ error: "Collection ID and Image ID are required" }, { status: 400 })
    }

    const supabase = createClient()

    // 检查集合是否属于当前用户
    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .select()
      .eq("id", collectionId)
      .eq("user_id", session.user.id)
      .single()

    if (collectionError || !collection) {
      return NextResponse.json({ error: "Collection not found or access denied" }, { status: 404 })
    }

    // 从集合中移除图像
    const { error } = await supabase
      .from("collection_images")
      .delete()
      .eq("collection_id", collectionId)
      .eq("image_id", imageId)

    if (error) {
      console.error("Error removing image from collection:", error)
      return NextResponse.json({ error: "Failed to remove image from collection" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/collections/[id]/images/[imageId]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
