import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"

// 创建国际化中间件
const intlMiddleware = createMiddleware({
  locales: ["en", "zh", "ja"],
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: true,
})

// 自定义中间件处理函数
export default async function middleware(request: NextRequest) {
  // 处理重定向
  const pathname = request.nextUrl.pathname

  // 让 /gallery 路径及其所有子路径直接放行，不加语言前缀
  if (pathname === "/gallery" || pathname.startsWith("/gallery/")) {
    return NextResponse.next()
  }

  // 重定向 /about 到首页
  if (pathname === "/about" || pathname.startsWith("/en/about") || pathname.startsWith("/zh/about")) {
    const url = new URL("/", request.url)
    return NextResponse.redirect(url)
  }

  // 重定向 /ai-lab 到首页
  if (pathname === "/ai-lab" || pathname.startsWith("/en/ai-lab") || pathname.startsWith("/zh/ai-lab")) {
    const url = new URL("/", request.url)
    return NextResponse.redirect(url)
  }

  // 对其他路径应用国际化中间件
  const response = await intlMiddleware(request)
  
  // 确保设置了locale头
  const locale = pathname.split('/')[1]
  if (locale === 'en' || locale === 'zh' || locale === 'ja') {
    response.headers.set('x-next-intl-locale', locale)
  }
  
  return response
}

// 配置匹配的路径
export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
