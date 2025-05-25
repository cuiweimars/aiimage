"use client"

import { useTranslations } from "next-intl"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface BlogAuthorProps {
  author: string
}

export function BlogAuthor({ author }: BlogAuthorProps) {
  const t = useTranslations("BlogAuthor")

  // 在实际应用中，您可能会从数据库获取作者的详细信息
  // 这里我们只使用作者名称

  return (
    <div className="flex items-center gap-4 mb-8 p-4 border rounded-lg bg-muted/50">
      <Avatar className="h-12 w-12">
        <AvatarImage src={`/placeholder.svg?height=100&width=100&text=${author.charAt(0)}`} alt={author} />
        <AvatarFallback>{author.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{author}</p>
        <p className="text-sm text-muted-foreground">{t("writtenBy", { name: author })}</p>
      </div>
    </div>
  )
}
