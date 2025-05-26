import { redirect } from "next/navigation"

export default function GalleryLocaleRedirect() {
  if (typeof window === "undefined") {
    redirect("/gallery")
  }
  return null
} 