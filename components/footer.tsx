"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

import { Logo } from "@/components/logo"

export function Footer() {
  const t = useTranslations("Footer")

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Logo className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">{t("description")}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">{t("product")}</h3>
            <ul className="space-y-3">
              {/* <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary">
                  {t("pricing")}
                </Link>
              </li> */}
              <li>
                <Link href="/gallery" className="text-sm text-muted-foreground hover:text-primary">
                  {t("gallery")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">{t("company")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                  {t("about")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">{t("legal")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} OmniGen AI. {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  )
}
