import type React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
}

export function HeroSkeleton() {
  return (
    <div className="w-full space-y-4">
      <Skeleton className="h-12 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-2/3 mx-auto" />
      <Skeleton className="h-4 w-2/3 mx-auto" />
      <div className="flex justify-center gap-4 pt-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

export function FeatureSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center text-center p-6 rounded-lg border">
          <Skeleton className="h-16 w-16 rounded-full mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full mt-1" />
          <Skeleton className="h-4 w-2/3 mt-1" />
        </div>
      ))}
    </div>
  )
}

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center text-center">
          <Skeleton className="h-10 w-24 mb-2" />
          <Skeleton className="h-5 w-32" />
        </div>
      ))}
    </div>
  )
}
