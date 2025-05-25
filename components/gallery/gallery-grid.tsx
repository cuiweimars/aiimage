"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { Download, Share, Maximize2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface GalleryImage {
  id: string
  prompt: string
  image_url: string
  created_at: string
  user_id: string
}

interface GalleryGridProps {
  images: GalleryImage[]
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const t = useTranslations("GalleryGrid")
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  const handleDownload = async (image: GalleryImage) => {
    try {
      const response = await fetch(image.image_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `image-${image.id}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(t("download.success.title"), {
        description: t("download.success.description"),
      })
    } catch (error) {
      console.error("Error downloading image:", error)
      toast.error(t("download.error.title"), {
        description: t("download.error.description"),
      })
    }
  }

  const handleShare = async (image: GalleryImage) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "OmniGen AI Generated Image",
          text: image.prompt,
          url: image.image_url,
        })
      } else {
        await navigator.clipboard.writeText(image.image_url)
        toast.success(t("share.clipboard.title"), {
          description: t("share.clipboard.description"),
        })
      }
    } catch (error) {
      console.error("Error sharing image:", error)
      toast.error(t("share.error.title"), {
        description: t("share.error.description"),
      })
    }
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("noImages")}</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {images.map((image) => (
          <div key={image.id} className="relative group overflow-hidden rounded-lg border bg-card cursor-pointer" onClick={() => {
            navigator.clipboard.writeText(image.prompt)
            toast.success('该图片提示词已经复制，快去试试吧！')
          }}>
            <div className="aspect-square overflow-hidden">
              <Image
                src={image.image_url || "/placeholder.svg"}
                alt="点击可复制提示词"
                width={400}
                height={400}
                className="h-full w-full object-cover transition-all group-hover:scale-105"
              />
            </div>
            <div className="p-2 text-xs text-muted-foreground text-center">
              {new Date(image.created_at).toLocaleString()}
            </div>
            <div className="absolute inset-0 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
              <div className="self-end flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/80 hover:bg-background/90"
                  onClick={e => { e.stopPropagation(); handleDownload(image) }}
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">{t("download.label")}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/80 hover:bg-background/90"
                  onClick={e => { e.stopPropagation(); setSelectedImage(image) }}
                >
                  <Maximize2 className="h-4 w-4" />
                  <span className="sr-only">{t("view")}</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t("imageDetails")}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedImage && (
              <div className="overflow-hidden rounded-lg">
                <Image
                  src={selectedImage.image_url || "/placeholder.svg"}
                  alt={selectedImage.prompt}
                  width={800}
                  height={800}
                  className="w-full object-contain"
                />
              </div>
            )}
          </div>
          <div className="flex justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {selectedImage && new Date(selectedImage.created_at).toLocaleDateString()}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => selectedImage && handleDownload(selectedImage)}
              >
                <Download className="h-4 w-4" />
                {t("download.label")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => selectedImage && handleShare(selectedImage)}
              >
                <Share className="h-4 w-4" />
                {t("share.label")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
