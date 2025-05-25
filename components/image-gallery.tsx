"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Download, Share, Trash2, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface GalleryImage {
  id: string
  prompt: string
  image_url: string
  r2_file_key?: string
  created_at: string
}

interface ImageGalleryProps {
  images: GalleryImage[]
}

export function ImageGallery({ images: initialImages }: ImageGalleryProps) {
  const t = useTranslations("ImageGallery")
  const [images, setImages] = useState<GalleryImage[]>(initialImages)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Refresh signed URLs when the component mounts
  useEffect(() => {
    const refreshSignedUrls = async () => {
      if (initialImages.length === 0) return

      const refreshedImages = await Promise.all(
        initialImages.map(async (image) => {
          // Only refresh if there's an R2 file key
          if (image.r2_file_key) {
            try {
              const response = await fetch(`/api/images/${image.id}/url`)

              if (response.ok) {
                const { url } = await response.json()
                return { ...image, image_url: url }
              }
            } catch (error) {
              console.error(`Failed to refresh URL for image ${image.id}:`, error)
            }
          }
          return image
        }),
      )

      setImages(refreshedImages)
    }

    refreshSignedUrls()
  }, [initialImages])

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
      toast(t("downloadSuccess"))
    } catch (error) {
      console.error("Error downloading image:", error)
      toast.error(t("downloadFailed"))
    }
  }

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt)
      toast(t("promptCopied"))
    } catch (error) {
      toast.error(t("copyFailed"))
    }
  }

  const handleShare = async (image: GalleryImage) => {
    try {
        await navigator.share({
        title: t("shareTitle"),
        text: t("shareText"),
          url: image.image_url,
        })
      toast(t("shareSuccess"))
    } catch (error) {
      toast.error(t("shareFailed"))
    }
  }

  const handleDelete = async (image: GalleryImage) => {
    try {
      setIsDeleting(true)

      const response = await fetch(`/api/images/${image.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete image")
      }

      setImages(images.filter((img) => img.id !== image.id))
      setIsDeleteDialogOpen(false)
      setSelectedImage(null)
      toast(t("deleteSuccess"))
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error(t("deleteFailed"))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {images.map((image) => (
          <div key={image.id} className="relative group overflow-hidden rounded-lg border bg-card">
            <div className="aspect-square overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.image_url || "/placeholder.svg"}
                alt={image.prompt}
                className="h-full w-full object-cover transition-all group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
              <div className="self-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-background/80 hover:bg-background/90"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">{t("actions")}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(image)}>
                      <Download className="mr-2 h-4 w-4" />
                      {t("download")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(image)}>
                      <Share className="mr-2 h-4 w-4" />
                      {t("share")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setSelectedImage(image)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <p className="text-xs text-white/70 line-clamp-2">{image.prompt}</p>
                <p className="text-xs text-white/50 mt-1">{new Date(image.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
            <DialogDescription>{t("deleteDialog.description")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              {t("deleteDialog.cancel")}
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(selectedImage!)} disabled={isDeleting}>
              {isDeleting ? t("deleteDialog.deleting") : t("deleteDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
