import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ImageActions } from "@/components/gallery/image-actions"

export default async function ImageDetailPage({ params }: { params: { imageId: string } }) {
  const t = await getTranslations("ImageDetail")
  const session = await getServerSession(authOptions)
  const { imageId } = params

  // 创建Supabase客户端
  const supabase = createClient()

  // 获取图像信息
  const { data: image, error } = await supabase.from("images").select("*").eq("id", imageId).single()

  if (error || !image) {
    console.error("Error fetching image:", error)
    notFound()
  }

  // 获取图像创建者信息
  const { data: user } = await supabase.from("users").select("name").eq("id", image.user_id).single()

  // 获取相似图像
  const { data: similarImages } = await supabase
    .from("images")
    .select("*")
    .neq("id", imageId)
    .eq("user_id", image.user_id)
    .order("created_at", { ascending: false })
    .limit(4)

  // 检查当前用户是否是图像所有者
  const isOwner = session?.user.id === image.user_id

  return (
    <div className="container py-8 md:py-12">
      <Button variant="ghost" asChild className="mb-6 pl-0 hover:pl-0">
        <Link href="/gallery" className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          {t("backToGallery")}
        </Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="relative rounded-lg overflow-hidden border bg-card">
          <div className="aspect-square">
            <Image
              src={image.image_url || "/placeholder.svg"}
              alt={image.prompt}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-4">{t("imageDetails")}</h1>
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">{t("prompt")}</h2>
              <p className="mt-1">{image.prompt}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">{t("creator")}</h2>
              <p className="mt-1">
                <Link href={`/gallery/user/${image.user_id}`} className="hover:underline">
                  {user?.name || t("unknownUser")}
                </Link>
              </p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">{t("createdAt")}</h2>
              <p className="mt-1">{new Date(image.created_at).toLocaleDateString()}</p>
            </div>
            <div className="pt-4">
              <ImageActions image={image} isOwner={isOwner} />
            </div>
          </div>
        </div>
      </div>

      {similarImages && similarImages.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">{t("moreFromCreator")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarImages.map((similarImage) => (
              <Link
                key={similarImage.id}
                href={`/gallery/image/${similarImage.id}`}
                className="relative aspect-square rounded-lg overflow-hidden border bg-card group"
              >
                <Image
                  src={similarImage.image_url || "/placeholder.svg"}
                  alt={similarImage.prompt}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
