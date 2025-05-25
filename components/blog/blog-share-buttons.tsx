"use client"

import { useTranslations } from "next-intl"
import { Twitter, Facebook, Linkedin, Link2, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface BlogShareButtonsProps {
  title: string
  slug: string
}

export function BlogShareButtons({ title, slug }: BlogShareButtonsProps) {
  const t = useTranslations("BlogShareButtons")

  // 构建完整URL
  const getShareUrl = () => {
    if (typeof window === "undefined") return ""
    return `${window.location.origin}/blog/${slug}`
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl())
      toast(t("linkCopied.title"))
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title,
        url: getShareUrl(),
      })
      toast(t("shareSuccess"))
    } catch (error) {
      toast.error(t("shareFailed"))
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground mr-1">{t("share")}:</span>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleShare()}>
        <Share2 className="h-4 w-4" />
        <span className="sr-only">{t("share")}</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleCopyLink}>
        <Link2 className="h-4 w-4" />
        <span className="sr-only">{t("copyLink")}</span>
      </Button>
    </div>
  )
}
