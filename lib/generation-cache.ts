/**
 * 图像生成缓存服务
 * 用于缓存生成结果，避免重复生成相同的图像
 */

import { createClient } from "@/lib/supabase/server"
import { generationConfig } from "./generation-config"

// 缓存键生成函数
function generateCacheKey(params: Record<string, any>): string {
  // 排序参数键以确保相同参数生成相同的缓存键
  const sortedParams = Object.keys(params)
    .sort()
    .reduce(
      (obj, key) => {
        obj[key] = params[key]
        return obj
      },
      {} as Record<string, any>,
    )

  // 创建缓存键
  return Buffer.from(JSON.stringify(sortedParams)).toString("base64")
}

// 缓存接口
export interface GenerationCache {
  get: (params: Record<string, any>) => Promise<string | null>
  set: (params: Record<string, any>, imageUrl: string) => Promise<void>
  invalidate: (cacheKey: string) => Promise<void>
}

// 数据库缓存实现
export class DatabaseGenerationCache implements GenerationCache {
  private enabled: boolean
  private maxAge: number
  private staleWhileRevalidate: number

  constructor() {
    const { enabled, maxAge, staleWhileRevalidate } = generationConfig.cache
    this.enabled = enabled
    this.maxAge = maxAge
    this.staleWhileRevalidate = staleWhileRevalidate
  }

  /**
   * 从缓存获取图像URL
   */
  async get(params: Record<string, any>): Promise<string | null> {
    if (!this.enabled) return null

    try {
      const cacheKey = generateCacheKey(params)
      const supabase = createClient()

      const { data, error } = await supabase
        .from("generation_cache")
        .select("image_url, created_at")
        .eq("cache_key", cacheKey)
        .single()

      if (error || !data) return null

      // 检查缓存是否过期
      const createdAt = new Date(data.created_at)
      const now = new Date()
      const ageInSeconds = (now.getTime() - createdAt.getTime()) / 1000

      // 如果缓存完全过期，返回null
      if (ageInSeconds > this.maxAge + this.staleWhileRevalidate) {
        return null
      }

      // 如果缓存过期但在staleWhileRevalidate期间内，标记为需要在后台刷新
      const needsRefresh = ageInSeconds > this.maxAge

      return data.image_url
    } catch (error) {
      console.error("Error getting from cache:", error)
      return null
    }
  }

  /**
   * 将图像URL存入缓存
   */
  async set(params: Record<string, any>, imageUrl: string): Promise<void> {
    if (!this.enabled) return

    try {
      const cacheKey = generateCacheKey(params)
      const supabase = createClient()

      // 使用upsert确保不会有重复项
      await supabase.from("generation_cache").upsert({
        cache_key: cacheKey,
        params: params,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error setting cache:", error)
    }
  }

  /**
   * 使缓存项失效
   */
  async invalidate(cacheKey: string): Promise<void> {
    if (!this.enabled) return

    try {
      const supabase = createClient()

      await supabase.from("generation_cache").delete().eq("cache_key", cacheKey)
    } catch (error) {
      console.error("Error invalidating cache:", error)
    }
  }

  /**
   * 更新缓存配置
   */
  updateConfig(config: Partial<typeof generationConfig.cache>) {
    if (config.enabled !== undefined) this.enabled = config.enabled
    if (config.maxAge) this.maxAge = config.maxAge
    if (config.staleWhileRevalidate) this.staleWhileRevalidate = config.staleWhileRevalidate
  }
}

// 创建单例
export const generationCache = new DatabaseGenerationCache()
