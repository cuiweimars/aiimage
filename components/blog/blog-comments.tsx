"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"

interface Comment {
  id: string
  author_name: string
  content: string
  created_at: string
}

interface BlogCommentsProps {
  postId: string
  postSlug: string
}

export function BlogComments({ postId, postSlug }: BlogCommentsProps) {
  const t = useTranslations("BlogComments")
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("validation.name"),
    }),
    email: z.string().email({
      message: t("validation.email"),
    }),
    comment: z.string().min(5, {
      message: t("validation.comment"),
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      comment: "",
    },
  })

  // 当会话变化时更新表单默认值
  useEffect(() => {
    if (session?.user) {
      form.setValue("name", session.user.name || "")
      form.setValue("email", session.user.email || "")
    }
  }, [session, form])

  // 加载评论
  useEffect(() => {
    async function loadComments() {
      try {
        const response = await fetch(`/api/blog/comments?postId=${postId}`)
        if (response.ok) {
          const data = await response.json()
          setComments(data)
        }
      } catch (error) {
        console.error("Error loading comments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadComments()
  }, [postId])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/blog/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          authorName: values.name,
          authorEmail: values.email,
          content: values.comment,
          userId: session?.user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit comment")
      }

      toast({
        title: t("success.title"),
        description: t("success.description"),
      })

      // 重置评论字段
      form.reset({
        name: values.name,
        email: values.email,
        comment: "",
      })

      // 如果评论需要审核，不需要刷新评论列表
      if (response.status === 201) {
        const newComment = await response.json()
        setComments([...comments, newComment])
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      toast({
        title: t("error.title"),
        description: t("error.description"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">{t("title")}</h2>

      {/* 评论列表 */}
      <div className="space-y-6 mb-8">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  <AvatarFallback>{comment.author_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{comment.author_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-4">{t("empty")}</p>
        )}
      </div>

      <Separator className="my-8" />

      {/* 评论表单 */}
      <div>
        <h3 className="text-xl font-bold mb-4">{t("leaveComment")}</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("namePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("emailPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("comment")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("commentPlaceholder")} className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
