"use client"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { GalleryGrid } from "@/components/gallery/gallery-grid"
import { GetServerSideProps } from 'next';
import en from '../messages/en.json';
import zh from '../messages/zh.json';
import ja from '../messages/ja.json';

interface GalleryImage {
  id: string
  prompt: string
  image_url: string
  created_at: string
  user_id: string
}

export default function GalleryPage() {
  const t = useTranslations("GalleryPage")
  const [images, setImages] = useState<GalleryImage[]>([])

  useEffect(() => {
    const fetchImages = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const res = await fetch(baseUrl + '/api/gallery', { cache: "no-store" })
      const rawImages = res.ok ? await res.json() : []
      setImages(rawImages.map((item: any, idx: number) => ({
        id: item.id || String(idx),
        prompt: item.prompt,
        image_url: item.imageUrl || item.image_url,
        created_at: item.createdAt || item.created_at,
        user_id: item.user_id || '',
      })))
    }
    fetchImages()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-16 pb-4 text-center overflow-hidden bg-black">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/20 to-transparent" />
        <h1 className="text-5xl font-extrabold text-primary mb-3 tracking-tight drop-shadow-lg">{t("title")}</h1>
        <div className="text-2xl font-semibold text-foreground mb-2">{t("subtitle")}</div>
        <div className="text-lg text-muted-foreground mb-6">{t("description")}</div>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="px-4 py-1 rounded-full bg-yellow-400/90 text-black font-bold text-base">{t("badge1")}</span>
          <span className="px-4 py-1 rounded-full bg-green-600/80 text-white font-bold text-base">{t("badge2")}</span>
          <span className="px-4 py-1 rounded-full bg-blue-500/80 text-white font-bold text-base">{t("badge3")}</span>
        </div>
      </section>
      <div className="max-w-7xl w-full mx-auto flex flex-col items-center px-4 md:px-6 pb-12 md:pb-24">
        <GalleryGrid images={images} />
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const locale = context.locale || 'en';
  let messages;
  if (locale === 'zh') messages = zh;
  else if (locale === 'ja') messages = ja;
  else messages = en;

  return {
    props: {
      locale,
      messages,
    },
  };
}; 