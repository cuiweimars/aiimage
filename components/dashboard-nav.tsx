"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { LayoutDashboard, Settings, ImageIcon, CreditCard, Users } from "lucide-react"

interface DashboardNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function DashboardNav({ className, items, ...props }: DashboardNavProps) {
  const pathname = usePathname()
  const t = useTranslations("DashboardNav")

  const defaultItems = [
    {
      href: "/dashboard",
      title: t("dashboard"),
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    },
    {
      href: "/gallery",
      title: t("gallery"),
      icon: <ImageIcon className="mr-2 h-4 w-4" />,
    },
    {
      href: "/referrals",
      title: t("referrals"),
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      href: "/subscription",
      title: t("subscription"),
      icon: <CreditCard className="mr-2 h-4 w-4" />,
    },
    {
      href: "/settings",
      title: t("settings"),
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]

  const navItems = items || defaultItems

  return (
    <nav className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)} {...props}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
            "justify-start",
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
