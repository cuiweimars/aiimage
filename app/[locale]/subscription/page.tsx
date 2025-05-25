import { getTranslations } from "next-intl/server"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { SubscriptionDashboard } from "@/components/subscription/subscription-dashboard"
import { SubscriptionUsage } from "@/components/subscription/subscription-usage"
import { SubscriptionHistory } from "@/components/subscription/subscription-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function SubscriptionPage() {
  const t = await getTranslations("SubscriptionPage")
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const supabase = createClient()

  // 获取用户订阅信息
  // Get user subscription information
  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (subscriptionError && subscriptionError.code !== "PGRST116") {
    console.error("Error fetching subscription:", subscriptionError)
  }

  // 获取用户订阅历史
  // Get user subscription history
  const { data: subscriptionHistory, error: historyError } = await supabase
    .from("subscription_history")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  if (historyError) {
    console.error("Error fetching subscription history:", historyError)
  }

  // 获取用户配额使用情况
  // Get user quota usage
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: todayCount, error: countError } = await supabase
    .from("images")
    .select("*", { count: "exact" })
    .eq("user_id", session.user.id)
    .gte("created_at", today.toISOString())

  if (countError) {
    console.error("Error fetching image count:", countError)
  }

  // 获取本月生成的图像数量
  // Get number of images generated this month
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const { count: monthCount, error: monthCountError } = await supabase
    .from("images")
    .select("*", { count: "exact" })
    .eq("user_id", session.user.id)
    .gte("created_at", firstDayOfMonth.toISOString())

  if (monthCountError) {
    console.error("Error fetching monthly image count:", monthCountError)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={t("title")} description={t("description")} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="usage">{t("tabs.usage")}</TabsTrigger>
          <TabsTrigger value="history">{t("tabs.history")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <SubscriptionDashboard
            subscription={subscription}
            todayUsage={todayCount || 0}
            monthlyUsage={monthCount || 0}
          />
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <SubscriptionUsage subscription={subscription} todayUsage={todayCount || 0} monthlyUsage={monthCount || 0} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <SubscriptionHistory history={subscriptionHistory || []} />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
