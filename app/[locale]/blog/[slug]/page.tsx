import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { CalendarIcon, Clock, Tag, ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BlogShareButtons } from "@/components/blog/blog-share-buttons"
import { BlogAuthor } from "@/components/blog/blog-author"
import { BlogRelatedPosts } from "@/components/blog/blog-related-posts"
import { BlogComments } from "@/components/blog/blog-comments"

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const t = await getTranslations("BlogPostPage")
  const { slug } = params

  // 创建Supabase客户端
  const supabase = createClient()

  // 获取博客文章
  const { data: post, error } = await supabase.from("blog_posts").select("*").eq("slug", slug).single()

  if (error || !post) {
    console.error("Error fetching blog post:", error)
    notFound()
  }

  // 获取相关文章
  const { data: relatedPosts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("category", post.category)
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(3)

  // 估计阅读时间（假设每分钟阅读200字）
  const wordCount = post.content.split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <Button variant="ghost" asChild className="mb-6 pl-0 hover:pl-0">
          <Link href="/blog" className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            {t("backToBlog")}
          </Link>
        </Button>

        {/* 文章标题和元数据 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {post.category}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {new Date(post.published_at).toLocaleDateString()}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {t("readingTime", { count: readingTime })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
          <p className="text-xl text-muted-foreground">{post.excerpt}</p>
        </div>

        {/* 封面图片已移除 */}

        {/* 作者信息 */}
        <BlogAuthor author={post.author} />

        {/* 分享按钮 */}
        <div className="flex justify-end mb-8">
          <BlogShareButtons title={post.title} slug={post.slug} />
        </div>

        {/* 文章内容 */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          {/* 这里应该使用Markdown或HTML渲染器来渲染内容 */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* 评论区 */}
        <BlogComments postId={post.id} postSlug={post.slug} />

        {/* 相关文章 */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="border-t pt-8 mt-12">
            <h2 className="text-2xl font-bold mb-6">{t("relatedPosts")}</h2>
            <BlogRelatedPosts posts={relatedPosts} />
          </div>
        )}
      </div>
    </div>
  )
}
