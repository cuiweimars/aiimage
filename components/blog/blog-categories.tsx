"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

interface BlogCategory {
  id: string
  name: string
  slug: string
}

interface BlogCategoriesProps {
  categories: BlogCategory[]
  activeCategory?: string
}

export function BlogCategories({ categories, activeCategory }: BlogCategoriesProps) {
  const t = useTranslations("BlogCategories")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleCategoryChange = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams)

    // 重置页码
    params.delete("page")

    if (categorySlug === "all") {
      params.delete("category")
    } else {
      params.set("category", categorySlug)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{t("title")}</h3>
      <div className="flex flex-col gap-1">
        <Button
          variant={!activeCategory || activeCategory === "all" ? "default" : "ghost"}
          className="justify-start"
          size="sm"
          onClick={() => handleCategoryChange("all")}
        >
          {t("allCategories")}
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.slug ? "default" : "ghost"}
            className="justify-start"
            size="sm"
            onClick={() => handleCategoryChange(category.slug)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
