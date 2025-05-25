/**
 * 批处理服务
 * 将多个图像生成请求合并为一个批处理，提高效率
 */

import { generationConfig } from "./generation-config"
import { replicate } from "@ai-sdk/replicate"
import { generateText } from "ai"

// 批处理项
interface BatchItem {
  id: string
  params: Record<string, any>
  resolve: (result: any) => void
  reject: (error: any) => void
  timestamp: number
}

class BatchProcessor {
  private batch: BatchItem[] = []
  private processingTimeout: NodeJS.Timeout | null = null
  private enabled: boolean
  private maxBatchSize: number
  private maxWaitTime: number

  constructor() {
    const { enabled, maxBatchSize, maxWaitTime } = generationConfig.batch
    this.enabled = enabled
    this.maxBatchSize = maxBatchSize
    this.maxWaitTime = maxWaitTime
  }

  /**
   * 添加请求到批处理
   */
  public add<T>(params: Record<string, any>): Promise<T> {
    if (!this.enabled) {
      // 如果批处理未启用，直接处理请求
      return this.processItem(params)
    }

    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(2, 9)

      this.batch.push({
        id,
        params,
        resolve,
        reject,
        timestamp: Date.now(),
      })

      // 如果达到最大批处理大小，立即处理
      if (this.batch.length >= this.maxBatchSize) {
        this.processBatch()
      } else if (!this.processingTimeout) {
        // 否则设置定时器，等待更多请求
        this.processingTimeout = setTimeout(() => {
          this.processBatch()
        }, this.maxWaitTime)
      }
    })
  }

  /**
   * 处理批处理
   */
  private async processBatch() {
    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout)
      this.processingTimeout = null
    }

    if (this.batch.length === 0) return

    const currentBatch = [...this.batch]
    this.batch = []

    try {
      // 这里是一个简化的实现，实际上需要根据API支持的批处理方式来实现
      // 由于Replicate API可能不支持真正的批处理，我们这里仍然是串行处理
      // 但在未来可以替换为真正的批处理API

      for (const item of currentBatch) {
        try {
          const result = await this.processItem(item.params)
          item.resolve(result)
        } catch (error) {
          item.reject(error)
        }
      }
    } catch (error) {
      // 如果批处理失败，回退到单个处理
      console.error("Batch processing failed, falling back to individual processing:", error)

      for (const item of currentBatch) {
        this.processItem(item.params)
          .then((result) => item.resolve(result))
          .catch((error) => item.reject(error))
      }
    }
  }

  /**
   * 处理单个项目
   */
  private async processItem<T>(params: Record<string, any>): Promise<T> {
    // 这里是实际的处理逻辑，调用Replicate API
    const { text: result } = await generateText({
      model: replicate.image(params.model || "vectorspacelab/omnigen"),
      prompt: params.prompt,
      providerOptions: {
        replicate: {
          ...params,
        },
      },
    })

    return result as unknown as T
  }

  /**
   * 更新批处理配置
   */
  public updateConfig(config: Partial<typeof generationConfig.batch>) {
    if (config.enabled !== undefined) this.enabled = config.enabled
    if (config.maxBatchSize) this.maxBatchSize = config.maxBatchSize
    if (config.maxWaitTime) this.maxWaitTime = config.maxWaitTime
  }
}

// 创建单例
export const batchProcessor = new BatchProcessor()
