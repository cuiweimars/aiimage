/**
 * 请求队列管理器
 * 用于管理并发请求，避免过多请求导致性能下降
 */

import { generationConfig } from "./generation-config"

// 请求项接口
interface QueueItem {
  id: string
  execute: () => Promise<any>
  resolve: (value: any) => void
  reject: (reason?: any) => void
  retryCount: number
  priority: number // 优先级：数字越小优先级越高
}

class RequestQueue {
  private queue: QueueItem[] = []
  private activeRequests = 0
  private maxConcurrent: number
  private retryCount: number
  private retryDelay: number
  private timeout: number

  constructor() {
    const { maxConcurrent, retryCount, retryDelay, timeout } = generationConfig.queue
    this.maxConcurrent = maxConcurrent
    this.retryCount = retryCount
    this.retryDelay = retryDelay
    this.timeout = timeout
  }

  /**
   * 添加请求到队列
   * @param execute 执行函数
   * @param priority 优先级（数字越小优先级越高）
   * @returns Promise
   */
  public enqueue<T>(execute: () => Promise<T>, priority = 10): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(2, 9)

      const queueItem: QueueItem = {
        id,
        execute,
        resolve,
        reject,
        retryCount: 0,
        priority,
      }

      // 按优先级插入队列
      const insertIndex = this.queue.findIndex((item) => item.priority > priority)
      if (insertIndex === -1) {
        this.queue.push(queueItem)
      } else {
        this.queue.splice(insertIndex, 0, queueItem)
      }

      this.processQueue()
    })
  }

  /**
   * 处理队列
   */
  private processQueue() {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    const item = this.queue.shift()
    if (!item) return

    this.activeRequests++

    // 设置超时
    const timeoutId = setTimeout(() => {
      this.handleRequestFailure(item, new Error("Request timeout"))
    }, this.timeout)

    item
      .execute()
      .then((result) => {
        clearTimeout(timeoutId)
        item.resolve(result)
        this.activeRequests--
        this.processQueue()
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        this.handleRequestFailure(item, error)
      })
  }

  /**
   * 处理请求失败
   */
  private handleRequestFailure(item: QueueItem, error: any) {
    if (item.retryCount < this.retryCount) {
      item.retryCount++
      console.log(`Retrying request ${item.id} (attempt ${item.retryCount})`)

      // 延迟后重试
      setTimeout(() => {
        this.queue.unshift(item)
        this.processQueue()
      }, this.retryDelay)
    } else {
      item.reject(error)
      this.activeRequests--
      this.processQueue()
    }
  }

  /**
   * 更新队列配置
   */
  public updateConfig(config: Partial<typeof generationConfig.queue>) {
    if (config.maxConcurrent) this.maxConcurrent = config.maxConcurrent
    if (config.retryCount) this.retryCount = config.retryCount
    if (config.retryDelay) this.retryDelay = config.retryDelay
    if (config.timeout) this.timeout = config.timeout
  }

  /**
   * 清空队列
   */
  public clearQueue() {
    const queuedItems = [...this.queue]
    this.queue = []

    // 拒绝所有排队的请求
    queuedItems.forEach((item) => {
      item.reject(new Error("Queue cleared"))
    })
  }
}

// 创建单例
export const requestQueue = new RequestQueue()
