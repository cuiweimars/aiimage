"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Twitter, Facebook, Linkedin, Copy, Check, PinIcon as Pinterest } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface SocialShareButtonsProps {
  url: string
  title: string
  imageUrl?: string
  description?: string
}

export function SocialShareButtons({ url, title, imageUrl, description }: SocialShareButtonsProps) {
  const t = useTranslations("SocialShareButtons")
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast(t("linkCopied"))
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
      toast.error(t("error"))
    }
  }

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    const encodedDescription = description ? encodeURIComponent(description) : ""
    const encodedImage = imageUrl ? encodeURIComponent(imageUrl) : ""

    let shareUrl = ""

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case "pinterest":
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`
        break
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={() => handleShare("twitter")}>
          <Twitter className="h-5 w-5" />
          <span className="sr-only">Twitter</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => handleShare("facebook")}
        >
          <Facebook className="h-5 w-5" />
          <span className="sr-only">Facebook</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => handleShare("linkedin")}
        >
          <Linkedin className="h-5 w-5" />
          <span className="sr-only">LinkedIn</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => handleShare("pinterest")}
        >
          <Pinterest className="h-5 w-5" />
          <span className="sr-only">Pinterest</span>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input value={url} readOnly className="flex-1" />
        <Button variant="outline" size="icon" onClick={handleCopyLink}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">{t("copyLink")}</span>
        </Button>
      </div>

      {imageUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">{t("embedCode")}</p>
          <div className="relative">
            <Input
              value={`<a href="${url}" target="_blank"><img src="${imageUrl}" alt="${title}" /></a>`}
              readOnly
              className="pr-10 font-mono text-xs"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => {
                navigator.clipboard.writeText(
                  `<a href="${url}" target="_blank"><img src="${imageUrl}" alt="${title}" /></a>`,
                )
                toast(t("embedCopied"))
              }}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">{t("copyEmbed")}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
