"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Download, Share2, Trash2, FolderPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { SocialShareButtons } from "@/components/social-share-buttons"

interface GalleryImage {
  id: string
  prompt: string
  image_url: string
  created_at: string
  user_id: string
}

interface ImageActionsProps {
  image: GalleryImage
  isOwner: boolean
}

export function ImageActions({ image, isOwner }: ImageActionsProps) {
  const t = useTranslations("ImageActions")
  const router = useRouter()
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDownload = async () => {
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

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/images/${image.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete image")
      }

      router.refresh()
      setIsDeleteDialogOpen(false)
      toast(t("deleteSuccess"))
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error(t("deleteFailed"))
    } finally {
      setIsDeleting(false)
    }
  }

  const getShareUrl = () => {
    if (typeof window === "undefined") return ""
    return `${window.location.origin}/gallery/${image.id}`
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          <span className="sr-only">{t("download")}</span>
        </Button>
        <Button variant="outline" size="icon" onClick={() => setIsShareDialogOpen(true)}>
          <Share2 className="h-4 w-4" />
          <span className="sr-only">{t("share")}</span>
        </Button>
        {isOwner && (
          <Button variant="outline" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4" />
            <span className="sr-only">{t("delete")}</span>
            </Button>
        )}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteImage")}</DialogTitle>
            <DialogDescription>{t("deleteImageDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? t("deleting") : t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("shareImage")}</DialogTitle>
            <DialogDescription>{t("shareImageDescription")}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <SocialShareButtons url={getShareUrl()} title={t("shareImageTitle")} imageUrl={image.image_url} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
