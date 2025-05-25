"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Download, Share2, Trash2, FolderPlus, Maximize2, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { SocialShareButtons } from "@/components/social-share-buttons"
import { AddToCollectionDialog } from "@/components/gallery/add-to-collection-dialog"

interface GalleryImage {
  id: string
  prompt: string
  image_url: string
  created_at: string
  user_id: string
}

interface Collection {
  id: string
  name: string
  user_id: string
  created_at: string
}

interface UserGalleryGridProps {
  images: GalleryImage[]
  isOwner: boolean
  userId: string
  collections: Collection[]
  currentCollectionId?: string
}

export function UserGalleryGrid({ images, isOwner, userId, collections, currentCollectionId }: UserGalleryGridProps) {
  const t = useTranslations("UserGalleryGrid")
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddToCollectionOpen, setIsAddToCollectionOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleDelete = async () => {
    if (!selectedImage) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/images/${selectedImage.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete image")
      }

      router.refresh()
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

  const handleRemoveFromCollection = async () => {
    if (!selectedImage || !currentCollectionId) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/collections/${currentCollectionId}/images/${selectedImage.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove image from collection")
      }

      router.refresh()
      setIsDeleteDialogOpen(false)
      setSelectedImage(null)
      toast(t("removeSuccess"))
    } catch (error) {
      console.error("Error removing image from collection:", error)
      toast.error(t("removeFailed"))
    } finally {
      setIsDeleting(false)
    }
  }

  const getImageShareUrl = (imageId: string) => {
    if (typeof window === "undefined") return ""
    return `${window.location.origin}/gallery/${imageId}`
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">{currentCollectionId ? t("noImagesInCollection") : t("noImages")}</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {images.map((image) => (
          <div key={image.id} className="relative group overflow-hidden rounded-lg border bg-card">
            <div className="aspect-square overflow-hidden">
              <Image
                src={image.image_url || "/placeholder.svg"}
                alt={image.prompt}
                width={400}
                height={400}
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
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedImage(image)
                        setIsShareDialogOpen(true)
                      }}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      {t("share")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedImage(image)
                        setIsViewDialogOpen(true)
                      }}
                    >
                      <Maximize2 className="mr-2 h-4 w-4" />
                      {t("view")}
                    </DropdownMenuItem>
                    {isOwner && (
                      <>
                        <DropdownMenuSeparator />
                        {collections.length > 0 && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedImage(image)
                              setIsAddToCollectionOpen(true)
                            }}
                          >
                            <FolderPlus className="mr-2 h-4 w-4" />
                            {t("addToCollection")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setSelectedImage(image)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {currentCollectionId ? t("removeFromCollection") : t("delete")}
                        </DropdownMenuItem>
                      </>
                    )}
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
            <DialogTitle>{currentCollectionId ? t("removeFromCollection") : t("deleteImage")}</DialogTitle>
            <DialogDescription>
              {currentCollectionId ? t("removeFromCollectionDescription") : t("deleteImageDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={currentCollectionId ? handleRemoveFromCollection : handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? t("processing") : currentCollectionId ? t("remove") : t("delete")}
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
            {selectedImage && (
              <SocialShareButtons
                url={getImageShareUrl(selectedImage.id)}
                title={t("shareImageTitle")}
                imageUrl={selectedImage.image_url}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t("viewImage")}</DialogTitle>
            {selectedImage && <DialogDescription>{selectedImage.prompt}</DialogDescription>}
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
                {t("download")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => {
                  setIsViewDialogOpen(false)
                  setIsShareDialogOpen(true)
                }}
              >
                <Share2 className="h-4 w-4" />
                {t("share")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

        <AddToCollectionDialog
        open={isAddToCollectionOpen}
        onOpenChange={setIsAddToCollectionOpen}
        image={selectedImage!}
          collections={collections}
          currentCollectionId={currentCollectionId}
        />
    </>
  )
}
