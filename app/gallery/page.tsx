import React from 'react'
import { useTranslations } from 'use-intl'

async function fetchGallery() {
  const res = await fetch('http://localhost:3000/api/gallery', { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export default async function GalleryPage() {
  const t = useTranslations('GalleryPage')
  const items = await fetchGallery()
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 md:px-8">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('title')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {items.length === 0 && <div className="col-span-full text-center text-muted-foreground">{t('empty')}</div>}
        {items.map((item: any, idx: number) => (
          <div key={idx} className="bg-card rounded-xl shadow p-4 flex flex-col items-center">
            <img src={item.imageUrl} alt={item.prompt} className="w-full aspect-square object-cover rounded-lg mb-3" />
            <div className="text-sm text-muted-foreground mb-1 truncate w-full text-center">{item.prompt}</div>
            <div className="text-xs text-muted-foreground text-center">{new Date(item.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
} 