"use client"

import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "next/navigation"
import { Globe } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const locales = [
    { code: "en", name: "English" },
    { code: "zh", name: "中文" },
    { code: "ja", name: "日本語" },
  ]

  const handleLocaleChange = (newLocale: string) => {
    // Replace the locale segment in the pathname
    const newPathname = pathname.replace(new RegExp(`^/${locale}`), `/${newLocale}`)
    router.push(newPathname)
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t("switchLocale")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => handleLocaleChange(loc.code)}
            className={locale === loc.code ? "bg-accent" : ""}
          >
            {loc.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
