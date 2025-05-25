"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Trash2, Eye, Star, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

interface BlogPost {
  id: string
  title: string
  slug: string
  category: string
  author: string
  published_at: string
  featured: boolean
}

interface BlogPostsTableProps {
  posts: BlogPost[]
}

export function BlogPostsTable({ posts: initialPosts }: BlogPostsTableProps) {
  const t = useTranslations("BlogPostsTable")
  const router = useRouter()
  const { toast } = useToast()
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 过滤文章
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 处理删除文章
  const handleDeletePost = async () => {
    if (!postToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/blog/posts/${postToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete post")
      }

      // 更新本地状态
      setPosts(posts.filter((post) => post.id !== postToDelete.id))

      toast({
        title: t("deleteSuccess.title"),
        description: t("deleteSuccess.description"),
      })

      setIsDeleteDialogOpen(false)
      setPostToDelete(null)
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: t("deleteError.title"),
        description: t("deleteError.description"),
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // 处理切换特色状态
  const handleToggleFeatured = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/blog/posts/${post.id}/featured`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ featured: !post.featured }),
      })

      if (!response.ok) {
        throw new Error("Failed to update featured status")
      }

      // 更新本地状态
      setPosts(posts.map((p) => (p.id === post.id ? { ...p, featured: !p.featured } : p)))

      toast({
        title: post.featured ? t("unfeatureSuccess.title") : t("featureSuccess.title"),
        description: post.featured ? t("unfeatureSuccess.description") : t("featureSuccess.description"),
      })
    } catch (error) {
      console.error("Error updating featured status:", error)
      toast({
        title: t("updateError.title"),
        description: t("updateError.description"),
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder={t("searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">{t("totalPosts", { count: posts.length })}</div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.title")}</TableHead>
              <TableHead>{t("columns.author")}</TableHead>
              <TableHead>{t("columns.category")}</TableHead>
              <TableHead>{t("columns.date")}</TableHead>
              <TableHead>{t("columns.status")}</TableHead>
              <TableHead className="w-[100px]">{t("columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {post.featured && <Star className="h-4 w-4 text-yellow-500" />}
                      <span className="truncate max-w-[250px]">{post.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{post.category}</Badge>
                  </TableCell>
                  <TableCell>{new Date(post.published_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      {t("published")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{t("openMenu")}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/blog/${post.slug}`} target="_blank" className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            {t("view")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/blog/edit/${post.id}`} className="flex items-center">
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("edit")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleFeatured(post)}>
                          {post.featured ? (
                            <>
                              <XCircle className="mr-2 h-4 w-4" />
                              {t("unfeature")}
                            </>
                          ) : (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              {t("feature")}
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setPostToDelete(post)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm ? t("noSearchResults") : t("noPosts")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
            <DialogDescription>{t("deleteDialog.description")}</DialogDescription>
          </DialogHeader>
          {postToDelete && (
            <div className="py-4">
              <p className="font-medium">{postToDelete.title}</p>
              <p className="text-sm text-muted-foreground">{t("deleteDialog.warning")}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              {t("deleteDialog.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeletePost} disabled={isDeleting}>
              {isDeleting ? t("deleteDialog.deleting") : t("deleteDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
