import { getTranslations } from "next-intl/server"
import GalleryGridWrapper from "@/components/gallery/gallery-grid-wrapper"

export default async function GalleryPage() {
  const t = await getTranslations("GalleryPage")
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(baseUrl + '/api/gallery', { cache: "no-store" })
  const rawImages: any[] = res.ok ? await res.json() : []
  const images = rawImages.map((item: any, idx: number) => ({
    id: item.id || String(idx),
    prompt: item.prompt,
    image_url: item.imageUrl || item.image_url,
    created_at: item.createdAt || item.created_at,
    user_id: item.user_id || '',
  }))

  return (
    <div className="max-w-7xl w-full mx-auto flex flex-col items-center px-4 md:px-6 py-12 md:py-24">
      <div className="flex flex-col items-center space-y-4 text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">{t("title")}</h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">{t("description")}</p>
      </div>
      <GalleryGridWrapper images={images} />
    </div>
  )
}
