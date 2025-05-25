"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PlusCircle, Share2, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { SocialShareButtons } from "@/components/social-share-buttons"

interface User {
  id: string
  name: string
  email: string
  image?: string
}

interface UserGalleryHeaderProps {
  user: User
  isOwner: boolean
  imageCount: number
  collectionCount: number
}

export function UserGalleryHeader({ user, isOwner, imageCount, collectionCount }: UserGalleryHeaderProps) {
  const t = useTranslations("UserGalleryHeader")
  const router = useRouter()
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [collectionName, setCollectionName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateCollection = async () => {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: collectionName }),
      })

      if (!response.ok) {
        throw new Error("Failed to create collection")
      }

      const data = await response.json()
      setIsCreateCollectionOpen(false)
      setCollectionName("")
      router.refresh()
      toast(t("createSuccess"))
    } catch (error) {
      console.error("Error creating collection:", error)
      toast.error(t("createFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const getShareUrl = () => {
    if (typeof window === "undefined") return ""
    return `${window.location.origin}/gallery/user/${user.id}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <Button variant="outline" onClick={() => setIsCreateCollectionOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("createCollection")}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  {t("settings")}
                </Link>
              </Button>
            </>
          )}
            <Button variant="outline" onClick={() => setIsShareDialogOpen(true)}>
              <Share2 className="mr-2 h-4 w-4" />
              {t("share")}
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">{t("images")}</h2>
          <p className="text-2xl font-bold">{imageCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">{t("collections")}</h2>
          <p className="text-2xl font-bold">{collectionCount}</p>
        </div>
      </div>

      <Dialog open={isCreateCollectionOpen} onOpenChange={setIsCreateCollectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createNewCollection")}</DialogTitle>
            <DialogDescription>{t("createNewCollectionDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="collection-name">{t("collectionName")}</Label>
              <Input
                id="collection-name"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder={t("collectionNamePlaceholder")}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateCollectionOpen(false)} disabled={isSubmitting}>
              {t("cancel")}
            </Button>
            <Button onClick={handleCreateCollection} disabled={isSubmitting || !collectionName.trim()}>
              {isSubmitting ? t("creating") : t("create")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("shareGallery")}</DialogTitle>
            <DialogDescription>{t("shareGalleryDescription")}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <SocialShareButtons url={getShareUrl()} title={t("shareTitle", { name: user.name })} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
