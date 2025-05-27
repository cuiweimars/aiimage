import type React from "react"
import { Inter } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getLocale } from "next-intl/server"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"
import { headers } from "next/headers"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { AuthProvider } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

import "@/app/globals.css"

// 优化字体加载
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // 使用字体交换以避免不可见文本闪烁
  preload: true, // 预加载字体
  adjustFontFallback: true, // 调整字体回退以减少布局偏移
})

export async function generateMetadata() {
  const headersList = await headers();
  const locale = headersList.get('x-next-intl-locale') || 'en';

  return {
    title: {
      default: "OmniGen AI - AI Image Generation Platform",
      template: "%s | OmniGen AI",
    },
    description: "Create stunning AI-generated images with OmniGen AI using state-of-the-art models",
    keywords: ["AI", "image generation", "artificial intelligence", "text to image", "omnigen"],
    authors: [{ name: "OmniGen AI" }],
    openGraph: {
      title: "OmniGen AI - AI Image Generation Platform",
      description: "Create stunning AI-generated images with OmniGen AI using state-of-the-art models",
      url: "https://omnigen.ai",
      siteName: "OmniGen AI",
      locale,
      type: "website",
    },
    // 添加资源提示，优化加载顺序
    other: {
      preload: [
        { as: "image", href: "/placeholder-logo.svg", type: "image/svg+xml" },
        { as: "style", href: "/globals.css" },
      ],
      preconnect: ["https://fonts.googleapis.com", "https://fonts.gstatic.com"],
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers();
  const locale = headersList.get('x-next-intl-locale') || 'en';
  const messages = await getMessages({ locale })

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* 预加载关键资源 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="/placeholder-logo.svg" as="image" type="image/svg+xml" />

        {/* 添加内联关键CSS */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          :root {
            --background: 0 0% 100%;
            --foreground: 222.2 84% 4.9%;
            --card: 0 0% 100%;
            --card-foreground: 222.2 84% 4.9%;
            --popover: 0 0% 100%;
            --popover-foreground: 222.2 84% 4.9%;
            --primary: 221.2 83.2% 53.3%;
            --primary-foreground: 210 40% 98%;
            --secondary: 210 40% 96.1%;
            --secondary-foreground: 222.2 47.4% 11.2%;
            --muted: 210 40% 96.1%;
            --muted-foreground: 215.4 16.3% 46.9%;
            --accent: 210 40% 96.1%;
            --accent-foreground: 222.2 47.4% 11.2%;
            --destructive: 0 84.2% 60.2%;
            --destructive-foreground: 210 40% 98%;
            --border: 214.3 31.8% 91.4%;
            --input: 214.3 31.8% 91.4%;
            --ring: 221.2 83.2% 53.3%;
            --radius: 0.5rem;
          }
          .dark {
            --background: 222.2 84% 4.9%;
            --foreground: 210 40% 98%;
            --card: 222.2 84% 4.9%;
            --card-foreground: 210 40% 98%;
            --popover: 222.2 84% 4.9%;
            --popover-foreground: 210 40% 98%;
            --primary: 217.2 91.2% 59.8%;
            --primary-foreground: 222.2 47.4% 11.2%;
            --secondary: 217.2 32.6% 17.5%;
            --secondary-foreground: 210 40% 98%;
            --muted: 217.2 32.6% 17.5%;
            --muted-foreground: 215 20.2% 65.1%;
            --accent: 217.2 32.6% 17.5%;
            --accent-foreground: 210 40% 98%;
            --destructive: 0 62.8% 30.6%;
            --destructive-foreground: 210 40% 98%;
            --border: 217.2 32.6% 17.5%;
            --input: 217.2 32.6% 17.5%;
            --ring: 224.3 76.3% 48%;
          }
          * {
            border-color: hsl(var(--border));
          }
          body {
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
          }
        `,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-YRZS5N4TJP"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-YRZS5N4TJP');
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
              <Suspense
                fallback={
                  <div className="min-h-screen flex flex-col">
                    <div className="h-16 border-b bg-background/95 backdrop-blur"></div>
                    <main className="flex-1 flex items-center justify-center">
                      <div className="animate-pulse text-xl">Loading...</div>
                    </main>
                  </div>
                }
              >
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </Suspense>
              <Toaster position="top-center" />
              <Analytics />
            </ThemeProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
