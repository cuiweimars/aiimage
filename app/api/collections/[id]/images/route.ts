import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions  NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// 添加图像到集合
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const collectionId = params.id

    if (!collectionId) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 })
    }

    const { imageId } = await req.json()

    if (!imageId) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 })
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

    // 检查图像是否存在
    const { data: image, error: imageError } = await supabase.from("images").select().eq("id", imageId).single()

    if (imageError || !image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // 检查图像是否已在集合中
    const { data: existingImage } = await supabase
      .from("collection_images")
      .select()
      .eq("collection_id", collectionId)
      .eq("image_id", imageId)
      .single()

    if (existingImage) {
      return NextResponse.json({ message: "Image already in collection" })
    }

    // 添加图像到集合
    const { error } = await supabase.from("collection_images").insert({
      collection_id: collectionId,
      image_id: imageId,
    })

    if (error) {
      console.error("Error adding image to collection:", error)
      return NextResponse.json({ error: "Failed to add image to collection" }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/collections/[id]/images:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
