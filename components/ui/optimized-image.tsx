"use client"

import { useState, useEffect } from "react"
import Image, { type ImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "className"> {
  className?: string
  containerClassName?: string
  lowQualitySrc?: string
}

export function OptimizedImage({
  src,
  alt,
  className,
  containerClassName,
  lowQualitySrc,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    // 简单的视口检测
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" },
    ) // 提前200px开始加载

    const container = document.getElementById(`image-container-${props.width}-${props.height}`)
    if (container) {
      observer.observe(container)
    }

    return () => {
      observer.disconnect()
    }
  }, [props.width, props.height])

  return (
    <div
      id={`image-container-${props.width}-${props.height}`}
      className={cn("overflow-hidden relative", containerClassName)}
      style={{ aspectRatio: `${props.width} / ${props.height}` }}
    >
      {/* 低质量占位图 */}
      {lowQualitySrc && !isLoaded && (
        <Image
          src={lowQualitySrc || "/placeholder.svg"}
          alt={alt}
          fill
          className="object-cover blur-sm scale-105"
          priority
        />
      )}

      {/* 实际图片，只有在视口中才加载 */}
      {isInView && (
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          className={cn("transition-opacity duration-500", isLoaded ? "opacity-100" : "opacity-0", className)}
          onLoad={() => setIsLoaded(true)}
          {...props}
        />
      )}

      {/* 加载中占位符 */}
      {!isLoaded && <div className="absolute inset-0 bg-muted/20 animate-pulse" />}
    </div>
  )
}
