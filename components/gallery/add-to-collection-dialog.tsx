"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

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

interface AddToCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  image: GalleryImage
  collections: Collection[]
  currentCollectionId?: string
}

export function AddToCollectionDialog({
  open,
  onOpenChange,
  image,
  collections,
  currentCollectionId,
}: AddToCollectionDialogProps) {
  const t = useTranslations("AddToCollectionDialog")
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [collectionImages, setCollectionImages] = useState<Record<string, string[]>>({})

  // 加载图像所在的集合
  useEffect(() => {
    const fetchCollectionImages = async () => {
      try {
        const response = await fetch(`/api/images/${image.id}/collections`)
        if (response.ok) {
          const data = await response.json()
          const imageCollections: Record<string, string[]> = {}

          data.forEach((item: { collection_id: string; image_id: string }) => {
            if (!imageCollections[item.collection_id]) {
              imageCollections[item.collection_id] = []
            }
            imageCollections[item.collection_id].push(item.image_id)
          })

          setCollectionImages(imageCollections)

          // 预选当前图像所在的集合
          const initialSelected = Object.keys(imageCollections)
          setSelectedCollections(initialSelected)
        }
      } catch (error) {
        console.error("Error fetching collection images:", error)
      }
    }

    if (open && image) {
      fetchCollectionImages()
    }
  }, [open, image])

  const toggleCollection = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId) ? prev.filter((id) => id !== collectionId) : [...prev, collectionId],
    )
  }

  const handleSave = async () => {
    setIsSubmitting(true)

    try {
      // 获取图像当前所在的集合
      const currentCollections = Object.keys(collectionImages)

      // 需要添加到的集合
      const collectionsToAdd = selectedCollections.filter((id) => !currentCollections.includes(id))

      // 需要从中移除的集合
      const collectionsToRemove = currentCollections.filter((id) => !selectedCollections.includes(id))

      // 添加到新集合
      for (const collectionId of collectionsToAdd) {
        await fetch(`/api/collections/${collectionId}/images`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageId: image.id,
          }),
        })
      }

      // 从旧集合中移除
      for (const collectionId of collectionsToRemove) {
        await fetch(`/api/collections/${collectionId}/images/${image.id}`, {
          method: "DELETE",
        })
      }

      toast({
        title: t("success"),
        description: t("successDescription"),
      })

      onOpenChange(false)

      // 如果当前在集合视图，并且从当前集合中移除了图像，则刷新页面
      if (currentCollectionId && collectionsToRemove.includes(currentCollectionId)) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating collections:", error)
      toast({
        title: t("error"),
        description: t("errorDescription"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[300px] mt-4">
          <div className="space-y-2 pr-4">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                  selectedCollections.includes(collection.id)
                    ? "bg-primary/10 border-primary/20 border"
                    : "hover:bg-muted border border-transparent"
                }`}
                onClick={() => toggleCollection(collection.id)}
              >
                <span className="font-medium">{collection.name}</span>
                {selectedCollections.includes(collection.id) && <Check className="h-4 w-4 text-primary" />}
              </div>
            ))}
            {collections.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">{t("noCollections")}</div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
