import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// 更新集合
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const collectionId = params.id

    if (!collectionId) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 })
    }

    const { name } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Collection name is required" }, { status: 400 })
    }

    const supabase = createClient()

    // 检查集合是否属于当前用户
    const { data: collection, error: fetchError } = await supabase
      .from("collections")
      .select()
      .eq("id", collectionId)
      .eq("user_id", session.user.id)
      .single()

    if (fetchError || !collection) {
      return NextResponse.json({ error: "Collection not found or access denied" }, { status: 404 })
    }

    // 更新集合
    const { data: updatedCollection, error } = await supabase
      .from("collections")
      .update({
        name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", collectionId)
      .select()
      .single()

    if (error) {
      console.error("Error updating collection:", error)
      return NextResponse.json({ error: "Failed to update collection" }, { status: 500 })
    }

    return NextResponse.json(updatedCollection)
  } catch (error) {
    console.error("Error in PATCH /api/collections/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// 删除集合
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const collectionId = params.id

    if (!collectionId) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // 检查集合是否属于当前用户
    const { data: collection, error: fetchError } = await supabase
      .from("collections")
      .select()
      .eq("id", collectionId)
      .eq("user_id", session.user.id)
      .single()

    if (fetchError || !collection) {
      return NextResponse.json({ error: "Collection not found or access denied" }, { status: 404 })
    }

    // 删除集合中的图像关联
    await supabase.from("collection_images").delete().eq("collection_id", collectionId)

    // 删除集合
    const { error } = await supabase.from("collections").delete().eq("id", collectionId)

    if (error) {
      console.error("Error deleting collection:", error)
      return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/collections/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
