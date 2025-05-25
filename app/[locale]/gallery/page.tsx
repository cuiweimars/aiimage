"use client"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { GalleryGrid } from "@/components/gallery/gallery-grid"

interface GalleryImage {
  id: string
  prompt: string
  image_url: string
  created_at: string
  user_id: string
}

export default function GalleryPage() {
  const t = useTranslations("GalleryPage")
  const [images, setImages] = useState<GalleryImage[]>([])

  useEffect(() => {
    const fetchImages = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const res = await fetch(baseUrl + '/api/gallery', { cache: "no-store" })
      const rawImages = res.ok ? await res.json() : []
      setImages(rawImages.map((item: any, idx: number) => ({
        id: item.id || String(idx),
        prompt: item.prompt,
        image_url: item.imageUrl || item.image_url,
        created_at: item.createdAt || item.created_at,
        user_id: item.user_id || '',
      })))
    }
    fetchImages()
  }, [])

  return (
    <div className="max-w-7xl w-full mx-auto flex flex-col items-center px-4 md:px-6 py-12 md:py-24">
      <div className="flex flex-col items-center space-y-4 text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">{t("title")}</h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">{t("description")}</p>
      </div>
      <GalleryGrid images={images} />
    </div>
  )
}
