import type React from "react"
import { PrefetchLinks } from "@/components/prefetch-links"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { headers } from "next/headers"
import { Toaster, toast } from "sonner"

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers();
  const locale = headersList.get('x-next-intl-locale') || 'en';
  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
      <Toaster position="top-center" />
      <PrefetchLinks />
    </NextIntlClientProvider>
  )
}
