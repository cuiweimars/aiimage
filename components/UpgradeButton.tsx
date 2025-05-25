"use client"
import { Button } from "@/components/ui/button"

export default function UpgradeButton({ children }: { children: React.ReactNode }) {
  return (
    <Button className="ml-auto bg-[#e2b86a] text-[#231c16] font-bold px-4 py-1 rounded-lg" onClick={() => window.location.href='/subscribe'}>
      {children}
    </Button>
  )
} 