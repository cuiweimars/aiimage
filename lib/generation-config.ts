/**
 * 图像生成优化配置
 */
export const generationConfig = {
  // 缓存设置
  cache: {
    enabled: true,
    maxAge: 60 * 60 * 24, // 24小时（秒）
    staleWhileRevalidate: 60 * 60, // 1小时（秒）
  },

  // 队列设置
  queue: {
    maxConcurrent: 3, // 最大并发请求数
    retryCount: 2, // 失败重试次数
    retryDelay: 1000, // 重试延迟（毫秒）
    timeout: 60000, // 请求超时（毫秒）
  },

  // 图像优化
  image: {
    compressionQuality: 90, // JPEG压缩质量
    useWebP: true, // 是否使用WebP格式（如果浏览器支持）
    placeholderBlur: true, // 是否使用模糊占位图
  },

  // 模型优化
  model: {
    prewarming: true, // 是否预热模型
    lowLatencyMode: false, // 低延迟模式（可能降低质量）
    optimizedDefaults: {
      // 针对速度优化的默认参数
      num_inference_steps: 25, // 减少步数以提高速度
      guidance_scale: 7.0, // 略微降低引导比例以提高速度
    },
  },

  // 批处理设置
  batch: {
    enabled: false, // 是否启用批处理
    maxBatchSize: 4, // 最大批处理大小
    maxWaitTime: 2000, // 最大等待时间（毫秒）
  },
}

/**
 * 根据用户订阅计划获取优化配置
 */
export function getOptimizedConfig(userPlan = "free") {
  const config = { ...generationConfig }

  // 根据用户计划调整配置
  switch (userPlan) {
    case "ultimate":
      // 高级用户获得更高的并发请求数和更好的图像质量
      config.queue.maxConcurrent = 5
      config.image.compressionQuality = 95
      config.model.lowLatencyMode = false
      break

    case "basic":
      // 基本订阅用户获得中等配置
      config.queue.maxConcurrent = 4
      config.image.compressionQuality = 92
      config.model.lowLatencyMode = false
      break

    default:
      // 免费用户获得基本配置
      config.queue.maxConcurrent = 2
      config.image.compressionQuality = 90
      config.model.lowLatencyMode = true
      break
  }

  return config
}

/**
 * 获取针对特定场景优化的参数
 */
export function getOptimizedParams(scenario: "speed" | "quality" | "balanced" = "balanced") {
  switch (scenario) {
    case "speed":
      return {
        num_inference_steps: 20,
        guidance_scale: 7.0,
        scheduler: "DPMSolverMultistep",
        high_resolution: false,
      }

    case "quality":
      return {
        num_inference_steps: 40,
        guidance_scale: 7.5,
        scheduler: "DDIM",
        high_resolution: true,
      }

    default:
      return {
        num_inference_steps: 30,
        guidance_scale: 7.5,
        scheduler: "DPMSolverMultistep",
        high_resolution: true,
      }
  }
}
