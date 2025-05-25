import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { config } from "@/lib/config"

// Create S3 client for R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2.accessKeyId!,
    secretAccessKey: config.r2.secretAccessKey!,
  },
})

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if the image belongs to the user
    const { data: image, error: fetchError } = await supabase
      .from("images")
      .select("*")
      .eq("id", imageId)
      .eq("user_id", session.user.id)
      .single()

    if (fetchError || !image) {
      return NextResponse.json({ error: "Image not found or access denied" }, { status: 404 })
    }

    // Delete the file from R2 if it has an R2 file key
    if (image.r2_file_key) {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: config.r2.bucketName!,
          Key: image.r2_file_key,
        })

        await s3Client.send(deleteCommand)
      } catch (r2Error) {
        console.error("Error deleting file from R2:", r2Error)
        // Continue with database deletion even if R2 deletion fails
      }
    }

    // Delete the image from the database
    const { error: deleteError } = await supabase.from("images").delete().eq("id", imageId)

    if (deleteError) {
      console.error("Error deleting image from database:", deleteError)
      return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
