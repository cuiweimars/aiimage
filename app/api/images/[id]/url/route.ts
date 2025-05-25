import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { getSignedFileUrl } from "@/lib/cloudflare-r2"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Allow unauthenticated access for public images, but we'll add authorization for user's own images
    const imageId = params.id

    if (!imageId) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Get the image details
    const { data: image, error: fetchError } = await supabase.from("images").select("*").eq("id", imageId).single()

    if (fetchError || !image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // If the image has an R2 file key, get a fresh signed URL
    if (image.r2_file_key) {
      const { success, url, error } = await getSignedFileUrl(image.r2_file_key)

      if (!success || !url) {
        console.error("Error getting signed URL:", error)
        return NextResponse.json({ error: "Failed to get signed URL" }, { status: 500 })
      }

      // Update the image_url in the database
      await supabase.from("images").update({ image_url: url }).eq("id", imageId)

      return NextResponse.json({ url })
    }

    // If there's no R2 file key, return the existing URL
    return NextResponse.json({ url: image.image_url })
  } catch (error) {
    console.error("Error getting image URL:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
