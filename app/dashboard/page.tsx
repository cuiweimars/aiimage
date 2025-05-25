import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"

import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { QuotaDisplay } from "@/components/subscription/quota-display"
import { ImageGenerator } from "@/components/image-generator"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const t = await getTranslations("Dashboard")

  if (!session) {
    redirect("/login")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={t("title")} text={t("description")} />
      <div className="grid gap-8">
        <QuotaDisplay />

        {/* 添加图像生成器组件 */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-2xl font-bold tracking-tight">{t("imageGenerator")}</h3>
            <p className="text-muted-foreground mb-4">{t("imageGeneratorDescription")}</p>
            <ImageGenerator />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
