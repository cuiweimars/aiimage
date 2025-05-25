"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function PrefetchLinks() {
  const router = useRouter()

  useEffect(() => {
    // 预取可能的下一个页面
    const prefetchNextPages = () => {
      // 预取常见的下一个页面
      router.prefetch("/dashboard")
      router.prefetch("/gallery")
      router.prefetch("/pricing")
      router.prefetch("/login")
      router.prefetch("/register")
    }

    // 当页面加载完成且空闲时预取
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      // @ts-ignore - requestIdleCallback 在某些 TypeScript 版本中可能没有类型定义
      window.requestIdleCallback(prefetchNextPages)
    } else {
      // 回退到 setTimeout
      setTimeout(prefetchNextPages, 2000)
    }
  }, [router])

  return null
}
