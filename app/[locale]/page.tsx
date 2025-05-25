import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { FeatureSkeleton, StatsSkeleton } from "@/components/ui/skeleton-loader"

// 动态导入组件，实现代码分割
const ImageGenerator = dynamic(
  () => import("@/components/image-generator").then((mod) => ({ default: mod.AIImageGeneratorPanel })),
  {
    loading: () => (
      <div className="w-full h-[400px] flex items-center justify-center">
        <p>Loading image generator...</p>
      </div>
    ),
  },
)

const Features = dynamic(() => import("@/components/features").then((mod) => ({ default: mod.Features })), {
  loading: () => <FeatureSkeleton />,
})

const Testimonials = dynamic(() => import("@/components/testimonials").then((mod) => ({ default: mod.Testimonials })), {
  loading: () => (
    <div className="w-full h-[300px] flex items-center justify-center">
      <p>Loading testimonials...</p>
    </div>
  ),
})

const Stats = dynamic(() => import("@/components/stats").then((mod) => ({ default: mod.Stats })), {
  loading: () => <StatsSkeleton />,
})

const FAQ = dynamic(() => import("@/components/faq").then((mod) => ({ default: mod.FAQ })), {
  loading: () => (
    <div className="w-full h-[300px] flex items-center justify-center">
      <p>Loading FAQ...</p>
    </div>
  ),
})

// 预加载图片组件
import Image from "next/image"
import { Sparkles } from "lucide-react"

// 添加资源提示，优化加载顺序
export const metadata = {
  title: {
    default: "Picasso AI - 免费AI图片生成器 | AI绘画 | AI Art Generator",
    template: "%s | Picasso AI"
  },
  description: "Picasso AI是全球首个无限制、免费且极速的AI图片生成器，支持多语言，数秒生成高质量AI图片，适合设计师、创作者、企业等多场景应用。",
  keywords: [
    "AI图片生成",
    "AI绘画",
    "AI Art Generator",
    "AI图片工具",
    "AI生成艺术",
    "AI图片创作",
    "Picasso AI"
  ],
  openGraph: {
    title: "Picasso AI - 免费AI图片生成器 | AI绘画 | AI Art Generator",
    description: "Picasso AI是全球首个无限制、免费且极速的AI图片生成器，支持多语言，数秒生成高质量AI图片。",
    url: "https://picassoai.com",
    siteName: "Picasso AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Picasso AI - 免费AI图片生成器"
      }
    ],
    locale: "zh_CN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Picasso AI - 免费AI图片生成器 | AI绘画 | AI Art Generator",
    description: "Picasso AI是全球首个无限制、免费且极速的AI图片生成器，支持多语言，数秒生成高质量AI图片。",
    images: ["/og-image.png"]
  },
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      zh: "/zh",
      ja: "/ja"
    }
  }
}

export default async function HomePage() {
  const t = await getTranslations('HomePage')

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero区：AI图像生成器主视觉 */}
      <section className="pt-16 pb-4 text-center">
        <h1 className="text-5xl font-extrabold text-primary mb-3 tracking-tight">{t('hero.title')}</h1>
        <div className="text-2xl font-semibold text-foreground mb-2">{t('hero.subtitle')}</div>
        <div className="text-lg text-muted-foreground mb-6">{t('hero.description')}</div>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="px-4 py-1 rounded-full bg-yellow-400/90 text-black font-bold text-base">{t('hero.badge1')}</span>
          <span className="px-4 py-1 rounded-full bg-green-600/80 text-white font-bold text-base">{t('hero.badge2')}</span>
          <span className="px-4 py-1 rounded-full bg-blue-500/80 text-white font-bold text-base">{t('hero.badge3')}</span>
          <span className="px-4 py-1 rounded-full bg-purple-600/80 text-white font-bold text-base">{t('hero.badge4')}</span>
        </div>
      </section>
      <section className="py-12 md:py-20 bg-background">
        <div className="max-w-3xl w-full mx-auto flex flex-col items-center px-4 md:px-6">
          {/* 头像 */}
          {/* 已移除重复的 hero 区域 */}
        </div>
      </section>
      {/* Image Generator Demo - 懒加载 */}
      <section className="py-12 md:py-24 bg-muted/50">
        <div className="max-w-7xl w-full mx-auto flex flex-col items-center px-4 md:px-6">
          <Suspense fallback={<div className="w-full h-[400px] bg-muted/20 rounded-lg animate-pulse"></div>}>
            <ImageGenerator />
          </Suspense>
        </div>
      </section>

      {/* Features - 懒加载 */}
      <Suspense
        fallback={
          <section className="py-12 md:py-24 bg-background">
            <div className="max-w-7xl w-full mx-auto flex flex-col items-center px-4 md:px-6">
              <div className="flex flex-col items-center space-y-4 text-center mb-10">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("features.title")}</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">{t("features.subtitle")}</p>
              </div>
              <FeatureSkeleton />
            </div>
          </section>
        }
      >
        <Features />
      </Suspense>

      {/* Stats - 懒加载 */}
      <Suspense
        fallback={
          <section className="py-12 md:py-24 bg-background border-y">
            <div className="max-w-7xl w-full mx-auto flex flex-col items-center px-4 md:px-6">
              <div className="flex flex-col items-center space-y-4 text-center mb-10">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("stats.title")}</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">{t("stats.subtitle")}</p>
              </div>
              <StatsSkeleton />
            </div>
          </section>
        }
      >
        <Stats />
      </Suspense>

      {/* Testimonials - 懒加载 */}
      <Suspense fallback={<div className="w-full h-[500px] bg-muted/20 animate-pulse"></div>}>
        <Testimonials />
      </Suspense>

      {/* FAQ - 懒加载 */}
      <Suspense fallback={<div className="w-full h-[500px] bg-muted/20 animate-pulse"></div>}>
        <FAQ />
      </Suspense>
    </div>
  )
}
