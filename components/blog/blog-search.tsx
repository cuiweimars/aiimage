"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function BlogSearch() {
  const t = useTranslations("BlogSearch")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams)

    // 重置页码
    params.delete("page")

    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim())
    } else {
      params.delete("search")
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{t("title")}</h3>
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder={t("placeholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9"
        />
        <Button type="submit" size="sm" className="h-9 px-3">
          <Search className="h-4 w-4" />
          <span className="sr-only">{t("search")}</span>
        </Button>
      </form>
    </div>
  )
}
