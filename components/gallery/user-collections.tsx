"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Pencil, Trash2, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface Collection {
  id: string
  name: string
  user_id: string
  created_at: string
}

interface UserCollectionsProps {
  collections: Collection[]
  currentCollectionId?: string
  userId: string
  isOwner: boolean
}

export function UserCollections({ collections, currentCollectionId, userId, isOwner }: UserCollectionsProps) {
  const t = useTranslations("UserCollections")
  const router = useRouter()
  const { toast } = useToast()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [collectionToEdit, setCollectionToEdit] = useState<Collection | null>(null)
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEditCollection = async () => {
    if (!collectionToEdit || !newCollectionName.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/collections/${collectionToEdit.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCollectionName,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update collection")
      }

      toast({
        title: t("collectionUpdated"),
        description: t("collectionUpdatedDescription"),
      })

      setIsEditDialogOpen(false)
      setCollectionToEdit(null)
      setNewCollectionName("")
      router.refresh()
    } catch (error) {
      console.error("Error updating collection:", error)
      toast({
        title: t("error"),
        description: t("errorUpdatingCollection"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCollection = async () => {
    if (!collectionToDelete) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/collections/${collectionToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete collection")
      }

      toast({
        title: t("collectionDeleted"),
        description: t("collectionDeletedDescription"),
      })

      setIsDeleteDialogOpen(false)
      setCollectionToDelete(null)

      // 如果删除的是当前集合，重定向到用户画廊
      if (collectionToDelete.id === currentCollectionId) {
        router.push(`/gallery/user/${userId}`)
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting collection:", error)
      toast({
        title: t("error"),
        description: t("errorDeletingCollection"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">{t("collections")}</h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 pb-2">
          <Button variant={!currentCollectionId ? "default" : "outline"} asChild className="flex-shrink-0" size="sm">
            <Link href={`/gallery/user/${userId}`}>{t("allImages")}</Link>
          </Button>
          {collections.map((collection) => (
            <div key={collection.id} className="flex-shrink-0 relative group">
              <Button
                variant={currentCollectionId === collection.id ? "default" : "outline"}
                asChild
                size="sm"
                className="pr-8"
              >
                <Link href={`/gallery/user/${userId}?collection=${collection.id}`}>{collection.name}</Link>
              </Button>
              {isOwner && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                        <span className="sr-only">{t("actions")}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setCollectionToEdit(collection)
                          setNewCollectionName(collection.name)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        {t("edit")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setCollectionToDelete(collection)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* 编辑集合对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editCollection")}</DialogTitle>
            <DialogDescription>{t("editCollectionDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-collection-name">{t("collectionName")}</Label>
              <Input
                id="edit-collection-name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder={t("collectionNamePlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
              {t("cancel")}
            </Button>
            <Button onClick={handleEditCollection} disabled={isSubmitting || !newCollectionName.trim()}>
              {isSubmitting ? t("updating") : t("update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除集合对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteCollection")}</DialogTitle>
            <DialogDescription>{t("deleteCollectionDescription")}</DialogDescription>
          </DialogHeader>
          {collectionToDelete && (
            <div className="py-4">
              <p className="font-medium">{collectionToDelete.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("deleteCollectionWarning")}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteCollection} disabled={isSubmitting}>
              {isSubmitting ? t("deleting") : t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
