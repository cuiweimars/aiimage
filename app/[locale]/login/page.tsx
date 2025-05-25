import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import Link from "next/link"

import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
}

export default async function LoginPage() {
  const t = await getTranslations("LoginPage")

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <div className="mx-auto w-full max-w-[350px] flex flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          {t("noAccount")} {" "}
          <Link href="/register" className="underline underline-offset-4 hover:text-primary">
            {t("signUp")}
          </Link>
        </p>
      </div>
    </div>
  )
}
