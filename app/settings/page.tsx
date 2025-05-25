import { getTranslations } from "next-intl/server"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { SettingsForm } from "@/components/settings-form"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubscriptionForm } from "@/components/subscription-form"

export default async function SettingsPage() {
  const t = await getTranslations("SettingsPage")
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const supabase = createClient()

  // Get user's subscription
  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", session.user.id)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching subscription:", error)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={t("title")} description={t("description")} />
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">{t("tabs.general")}</TabsTrigger>
          <TabsTrigger value="subscription">{t("tabs.subscription")}</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">{t("profile.title")}</h3>
              <p className="text-sm text-muted-foreground">{t("profile.description")}</p>
            </div>
            <Separator />
            <SettingsForm user={session.user} />
          </div>
        </TabsContent>
        <TabsContent value="subscription" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">{t("subscription.title")}</h3>
              <p className="text-sm text-muted-foreground">{t("subscription.description")}</p>
            </div>
            <Separator />
            <SubscriptionForm subscription={subscription} />
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
