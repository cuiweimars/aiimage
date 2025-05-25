import { getTranslations } from "next-intl/server"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { BlogPostsTable } from "@/components/admin/blog-posts-table"
import { BlogCategoriesTable } from "@/components/admin/blog-categories-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const t = await getTranslations("AdminBlog")
  const session = await getServerSession(authOptions)

  // 检查用户是否已登录
  if (!session) {
    redirect("/login")
  }

  // 创建Supabase客户端
  const supabase = createClient()

  // 获取用户角色（在实际应用中，您需要有一个用户角色系统）
  // 这里我们简单地假设所有登录用户都是管理员
  const isAdmin = true

  if (!isAdmin) {
    redirect("/dashboard")
  }

  // 获取博客文章
  const { data: posts, error: postsError } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false })

  if (postsError) {
    console.error("Error fetching blog posts:", postsError)
  }

  // 获取博客分类
  const { data: categories, error: categoriesError } = await supabase
    .from("blog_categories")
    .select("*")
    .order("name", { ascending: true })

  if (categoriesError) {
    console.error("Error fetching blog categories:", categoriesError)
  }

  // 获取待审核的评论数量
  const { count: pendingCommentsCount, error: commentsError } = await supabase
    .from("blog_comments")
    .select("*", { count: "exact" })
    .eq("status", "pending")

  if (commentsError) {
    console.error("Error fetching pending comments count:", commentsError)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={t("title")} description={t("description")}>
        <Button asChild>
          <Link href="/admin/blog/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("newPost")}
          </Link>
        </Button>
      </DashboardHeader>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">{t("tabs.posts")}</TabsTrigger>
          <TabsTrigger value="categories">{t("tabs.categories")}</TabsTrigger>
          <TabsTrigger value="comments">
            {t("tabs.comments")}
            {pendingCommentsCount ? (
              <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {pendingCommentsCount}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="space-y-4">
          <BlogPostsTable posts={posts || []} />
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <BlogCategoriesTable categories={categories || []} />
        </TabsContent>
        <TabsContent value="comments" className="space-y-4">
          <p>{t("commentsTabContent")}</p>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
