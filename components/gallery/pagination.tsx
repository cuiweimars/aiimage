"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const t = useTranslations("Pagination")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  // 生成页码数组
  const generatePagination = () => {
    // 如果总页数小于7，显示所有页码
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // 如果当前页接近开始
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, "...", totalPages]
    }

    // 如果当前页接近结束
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    // 如果当前页在中间
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]
  }

  const pages = generatePagination()

  return (
    <div className="flex justify-center items-center gap-1 mt-8">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={currentPage <= 1}
        onClick={() => router.push(createPageURL(currentPage - 1))}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">{t("previous")}</span>
      </Button>

      {pages.map((page, i) =>
        page === "..." ? (
          <Button key={`ellipsis-${i}`} variant="outline" size="icon" className="h-8 w-8" disabled>
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">{t("more")}</span>
          </Button>
        ) : (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push(createPageURL(page))}
          >
            {page}
            <span className="sr-only">
              {t("page")} {page}
            </span>
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={currentPage >= totalPages}
        onClick={() => router.push(createPageURL(currentPage + 1))}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">{t("next")}</span>
      </Button>
    </div>
  )
}
