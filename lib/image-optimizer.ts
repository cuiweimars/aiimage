/**
 * 图像优化服务
 * 用于优化生成的图像，提高加载速度和质量
 */

import sharp from "sharp"
import { generationConfig } from "./generation-config"
import { generateFileKey, uploadFileToR2, getSignedFileUrl } from "./cloudflare-r2"
import https from "https"
import type { SecureVersion } from "tls"

// 图像格式
type ImageFormat = "jpeg" | "webp" | "avif" | "png"

// 图像优化选项
interface OptimizeOptions {
  format?: ImageFormat
  quality?: number
  width?: number
  height?: number
  fit?: "cover" | "contain" | "fill" | "inside" | "outside"
  withMetadata?: boolean
}

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  initialTimeout: 15000, // 15 seconds
  maxTimeout: 30000, // 30 seconds
  backoffFactor: 1.5,
}

// SSL 配置
const SSL_CONFIG = {
  rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "0",
  minVersion: "TLSv1.2" as SecureVersion,
  ciphers: [
    "ECDHE-ECDSA-AES128-GCM-SHA256",
    "ECDHE-RSA-AES128-GCM-SHA256",
    "ECDHE-ECDSA-AES256-GCM-SHA384",
    "ECDHE-RSA-AES256-GCM-SHA384",
    "ECDHE-ECDSA-CHACHA20-POLY1305",
    "ECDHE-RSA-CHACHA20-POLY1305",
    "DHE-RSA-AES128-GCM-SHA256",
    "DHE-RSA-AES256-GCM-SHA384"
  ].join(":"),
}

// 代理配置
const PROXY_CONFIG = {
  enabled: process.env.USE_PROXY === "true",
  host: process.env.PROXY_HOST || "127.0.0.1",
  port: process.env.PROXY_PORT || "7890",
}

/**
 * 带重试的 fetch 函数
 */
async function fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
  let lastError: Error | null = null
  let timeout = RETRY_CONFIG.initialTimeout

  // 配置 SSL
  const agent = new https.Agent({
    rejectUnauthorized: SSL_CONFIG.rejectUnauthorized,
    minVersion: SSL_CONFIG.minVersion,
    ciphers: SSL_CONFIG.ciphers,
  })

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`Fetching image (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries})...`)
      console.log("URL:", url)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      // 使用 node-fetch 的扩展选项
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        // @ts-ignore - agent 是 node-fetch 的扩展选项
        agent,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response
    } catch (error) {
      lastError = error as Error
      console.error(`Attempt ${attempt + 1} failed:`, error)

      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        // 增加超时时间
        timeout = Math.min(timeout * RETRY_CONFIG.backoffFactor, RETRY_CONFIG.maxTimeout)
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error("Failed to fetch image after all retries")
}

/**
 * 优化图像
 */
export async function optimizeImage(imageBuffer: Buffer, options: OptimizeOptions = {}): Promise<Buffer> {
  const {
    format = "jpeg",
    quality = generationConfig.image.compressionQuality,
    width,
    height,
    fit = "cover",
    withMetadata = false,
  } = options

  let pipeline = sharp(imageBuffer)

  // 调整大小（如果指定）
  if (width || height) {
    pipeline = pipeline.resize({
      width,
      height,
      fit,
      withoutEnlargement: true,
    })
  }

  // 根据格式输出
  switch (format) {
    case "webp":
      return pipeline.webp({ quality }).toBuffer()
    case "avif":
      return pipeline.avif({ quality }).toBuffer()
    case "png":
      return pipeline.png().toBuffer()
    case "jpeg":
    default:
      return pipeline.jpeg({ quality, mozjpeg: true }).toBuffer()
  }
}

/**
 * 检测浏览器是否支持WebP
 */
export function supportsWebP(userAgent: string): boolean {
  // 检查常见支持WebP的浏览器
  return (
    userAgent.includes("Chrome/") ||
    userAgent.includes("Firefox/") ||
    userAgent.includes("Edge/") ||
    userAgent.includes("Safari/14") ||
    userAgent.includes("Safari/15") ||
    userAgent.includes("Safari/16")
  )
}

/**
 * 处理并优化从URL获取的图像
 */
export async function processAndOptimizeImage(
  imageUrl: string,
  userId: string,
  options: OptimizeOptions = {},
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log("Starting image optimization process...")
    console.log("Image URL:", imageUrl)

    // 获取图像（带重试）
    const response = await fetchWithRetry(imageUrl)
    console.log("Successfully fetched image")

    // 转换为Buffer
    const imageBuffer = Buffer.from(await response.arrayBuffer())
    console.log("Converted image to buffer")

    // 优化图像
    console.log("Optimizing image...")
    const optimizedBuffer = await optimizeImage(imageBuffer, options)
    console.log("Image optimization completed")

    // 上传到R2
    console.log("Uploading to R2...")
    const fileKey = generateFileKey(userId)
    const uploadResult = await uploadFileToR2(optimizedBuffer, fileKey)

    if (!uploadResult.success) {
      throw new Error("Failed to upload optimized image")
    }

    // 获取签名URL
    console.log("Getting signed URL...")
    const signedUrlResult = await getSignedFileUrl(fileKey)
    if (!signedUrlResult.success || !signedUrlResult.url) {
      throw new Error("Failed to get signed URL")
    }

    console.log("Image processing completed successfully")
    return { success: true, url: signedUrlResult.url }
  } catch (error) {
    console.error("Error optimizing image:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error optimizing image",
    }
  }
}

/**
 * 生成图像的模糊占位符
 */
export async function generateBlurPlaceholder(imageBuffer: Buffer): Promise<string> {
  // 创建一个小的模糊版本作为占位符
  const placeholderBuffer = await sharp(imageBuffer).resize(20, 20, { fit: "inside" }).blur(10).toBuffer()

  // 转换为base64
  return `data:image/png;base64,${placeholderBuffer.toString("base64")}`
}
