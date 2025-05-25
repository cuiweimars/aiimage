"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  cover_image: string
  published_at: string
}

interface BlogRelatedPostsProps {
  posts: BlogPost[]
}

export function BlogRelatedPosts({ posts }: BlogRelatedPostsProps) {
  const t = useTranslations("BlogRelatedPosts")

  if (!posts || posts.length === 0) {
    return <p className="text-muted-foreground">{t("empty")}</p>
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.slug}`} className="group">
          <div className="space-y-3">
            {/* 移除预览图片渲染 */}
            {/* <div className="relative h-40 w-full overflow-hidden rounded-lg">
              <Image
                src={post.cover_image || "/placeholder.svg?height=300&width=400&text=Blog+Cover"}
                alt={post.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div> */}
            <div>
              <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{new Date(post.published_at).toLocaleDateString()}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
