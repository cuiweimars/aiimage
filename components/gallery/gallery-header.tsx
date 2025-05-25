"use client"

import { useRouter, usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface GalleryHeaderProps {
  sort: string
  filter: string
}

export function GalleryHeader({ sort, filter }: GalleryHeaderProps) {
  const t = useTranslations("GalleryHeader")
  const router = useRouter()
  const pathname = usePathname()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams()
    params.set("sort", value)
    if (filter !== "all") {
      params.set("filter", filter)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams()
    if (sort !== "latest") {
      params.set("sort", sort)
    }
    if (value !== "all") {
      params.set("filter", value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div className="text-sm text-muted-foreground">{t("showing")}</div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <SlidersHorizontal className="h-4 w-4" />
              {t("sort.label")}: {t(`sort.options.${sort}`)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={sort} onValueChange={handleSortChange}>
              <DropdownMenuRadioItem value="latest">{t("sort.options.latest")}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="oldest">{t("sort.options.oldest")}</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              {t("filter.label")}: {t(`filter.options.${filter}`)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={filter} onValueChange={handleFilterChange}>
              <DropdownMenuRadioItem value="all">{t("filter.options.all")}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="landscape">{t("filter.options.landscape")}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="portrait">{t("filter.options.portrait")}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="abstract">{t("filter.options.abstract")}</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
