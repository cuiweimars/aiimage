import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// 获取图像所在的集合
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const imageId = params.id

    if (!imageId) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // 获取图像所在的集合
    const { data, error } = await supabase
      .from("collection_images")
      .select("collection_id, image_id")
      .eq("image_id", imageId)

    if (error) {
      console.error("Error fetching image collections:", error)
      return NextResponse.json({ error: "Failed to fetch image collections" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/images/[id]/collections:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
