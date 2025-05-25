"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useSession, signOut } from "next-auth/react"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Logo } from "@/components/logo"
import { ModeToggle } from "@/components/mode-toggle"
import { LocaleSwitcher } from "@/components/locale-switcher"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations("Header")
  const { data: session } = useSession()

  const navigation = [
    { name: t("home"), href: "/" },
    // { name: t("pricing"), href: "http://localhost:3000/zh/subscribe" }, // 注释掉价格菜单
    { name: t("gallery"), href: "/gallery" },
    // { name: t("blog"), href: "/blog" }, // 注释掉博客菜单
  ]

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">OmniGen AI</span>
            <Logo className="h-8 w-auto" />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setIsMenuOpen(true)}
          >
            <span className="sr-only">{t("openMenu")}</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 items-center">
          <LocaleSwitcher />
          <ModeToggle />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback>
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {session.user?.name && <p className="font-medium">{session.user.name}</p>}
                    {session.user?.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user.email}</p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">{t("profile", { defaultValue: "个人资料" })}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault()
                    signOut({ callbackUrl: "/" })
                  }}
                >
                  {t("signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">{t("signIn")}</Link>
              </Button>
              <Button asChild>
                <Link href="/register">{t("signUp")}</Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">OmniGen AI</span>
                <Logo className="h-8 w-auto" />
              </Link>
              <button type="button" className="-m-2.5 rounded-md p-2.5" onClick={() => setIsMenuOpen(false)}>
                <span className="sr-only">{t("closeMenu")}</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-accent"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  <div className="flex items-center gap-x-4 mb-4">
                    <LocaleSwitcher />
                    <ModeToggle />
                  </div>
                  {session ? (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                          <AvatarFallback>
                            {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          {session.user?.name && <p className="font-medium">{session.user.name}</p>}
                          {session.user?.email && (
                            <p className="truncate text-sm text-muted-foreground">{session.user.email}</p>
                          )}
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-accent"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t("profile", { defaultValue: "个人资料" })}
                      </Link>
                      <button
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-accent w-full text-left"
                        onClick={() => {
                          setIsMenuOpen(false)
                          signOut({ callbackUrl: "/" })
                        }}
                      >
                        {t("signOut")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-accent"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t("signIn")}
                      </Link>
                      <Link
                        href="/register"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-accent"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t("signUp")}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
