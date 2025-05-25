"use client"

import Link from "next/link"
import Image from "next/image"
import { CalendarIcon, Tag } from "lucide-react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  author: string
  category: string
  published_at: string
  featured: boolean
}

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  const t = useTranslations("BlogCard")

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardContent className="flex-1 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {post.category}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            {new Date(post.published_at).toLocaleDateString()}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h3>
        <p className="text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>
      </CardContent>
      <CardFooter className="pt-0 pb-5 px-5">
        <Button asChild variant="outline" size="sm">
          <Link href={`/blog/${post.slug}`}>{t("readMore")}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
