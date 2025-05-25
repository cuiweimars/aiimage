import { S3Client } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { config } from "@/lib/config"

// Create S3 client with Cloudflare R2 credentials
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2.accessKeyId!,
    secretAccessKey: config.r2.secretAccessKey!,
  },
})

// Generate a unique file key based on user ID and timestamp
export const generateFileKey = (userId: string, fileExtension = "png") => {
  const timestamp = Date.now()
  return `${userId}/${timestamp}.${fileExtension}`
}

// Upload a file to R2
export const uploadFileToR2 = async (fileBuffer: Buffer, fileKey: string, contentType = "image/png") => {
  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: config.r2.bucketName!,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: contentType,
      },
    })

    await upload.done()
    return { success: true, fileKey }
  } catch (error) {
    console.error("Error uploading file to R2:", error)
    return { success: false, error }
  }
}

// Get a signed URL for accessing a file (valid for 1 hour by default)
export const getSignedFileUrl = async (fileKey: string, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: config.r2.bucketName!,
      Key: fileKey,
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn })
    return { success: true, url: signedUrl }
  } catch (error) {
    console.error("Error getting signed URL:", error)
    return { success: false, error }
  }
}

// Generate a presigned URL for uploading a file directly from the client
export const getPresignedUploadUrl = async (fileKey: string, contentType = "image/png", expiresIn = 3600) => {
  try {
    const command = new PutObjectCommand({
      Bucket: config.r2.bucketName!,
      Key: fileKey,
      ContentType: contentType,
    })

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn })
    return { success: true, url: presignedUrl }
  } catch (error) {
    console.error("Error getting presigned upload URL:", error)
    return { success: false, error }
  }
}
