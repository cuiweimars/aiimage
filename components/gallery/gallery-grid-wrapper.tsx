"use client"
import { GalleryGrid } from "./gallery-grid"
export default function GalleryGridWrapper({ images }: { images: any[] }) {
  return <GalleryGrid images={images} />
} 