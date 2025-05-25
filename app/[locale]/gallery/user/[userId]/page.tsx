import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

import { UserGalleryHeader } from "@/components/gallery/user-gallery-header"
import { UserGalleryGrid } from "@/components/gallery/user-gallery-grid"
import { Pagination } from "@/components/gallery/pagination"
import { UserCollections } from "@/components/gallery/user-collections"

export default async function UserGalleryPage({
  params,
  searchParams,
}: {
  params: { userId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const t = await getTranslations("UserGallery")
  const session = await getServerSession(authOptions)
  const { userId } = params

  // 获取查询参数
  const page = typeof searchParams.page === "string" ? Number.parseInt(searchParams.page) : 1
  const perPage = 20
  const collectionId = typeof searchParams.collection === "string" ? searchParams.collection : undefined

  // 创建Supabase客户端
  const supabase = createClient()

  // 获取用户信息
  const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

  if (userError || !user) {
    console.error("Error fetching user:", userError)
    notFound()
  }

  // 构建查询
  let query = supabase.from("images").select("*", { count: "exact" }).eq("user_id", userId)

  // 如果指定了集合，则只获取该集合中的图像
  if (collectionId) {
    const { data: collectionImages } = await supabase
      .from("collection_images")
      .select("image_id")
      .eq("collection_id", collectionId)

    if (collectionImages && collectionImages.length > 0) {
      const imageIds = collectionImages.map((item) => item.image_id)
      query = query.in("id", imageIds)
    } else {
      // 如果集合中没有图像，返回空数组
      return {
        props: {
          user,
          images: [],
          totalPages: 0,
          isOwner: session?.user.id === userId,
          collections: [],
          currentCollection: null,
        },
      }
    }
  }

  // 应用排序和分页
  query = query.order("created_at", { ascending: false })
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  // 执行查询
  const { data: images, count, error: imagesError } = await query.range(from, to)

  if (imagesError) {
    console.error("Error fetching images:", imagesError)
  }

  // 获取用户的集合
  const { data: collections, error: collectionsError } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (collectionsError) {
    console.error("Error fetching collections:", collectionsError)
  }

  // 如果指定了集合ID，获取集合详情
  let currentCollection = null
  if (collectionId) {
    const { data: collection } = await supabase.from("collections").select("*").eq("id", collectionId).single()
    currentCollection = collection
  }

  // 计算总页数
  const totalPages = count ? Math.ceil(count / perPage) : 0

  // 检查当前用户是否是画廊所有者
  const isOwner = session?.user.id === userId

  return (
    <div className="container py-8 md:py-12">
      <UserGalleryHeader
        user={user}
        isOwner={isOwner}
        imageCount={count || 0}
        collectionCount={collections?.length || 0}
      />

      {collections && collections.length > 0 && (
        <div className="mb-8">
          <UserCollections
            collections={collections}
            currentCollectionId={collectionId}
            userId={userId}
            isOwner={isOwner}
          />
        </div>
      )}

      <UserGalleryGrid
        images={images || []}
        isOwner={isOwner}
        userId={userId}
        collections={collections || []}
        currentCollectionId={collectionId}
      />

      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} />}
    </div>
  )
}
