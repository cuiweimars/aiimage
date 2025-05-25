"use client"
import { Button } from "@/components/ui/button"

export default function UpgradeNowButton({ children }: { children: React.ReactNode }) {
  return (
    <Button className="w-full bg-[#e2b86a] text-[#231c16] font-bold rounded-lg py-2 text-base" onClick={() => window.location.href='/subscribe'}>
      {children}
    </Button>
  )
} 