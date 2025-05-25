import { getTranslations } from "next-intl/server"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReferralDashboard } from "@/components/referrals/referral-dashboard"
import { ReferralHistory } from "@/components/referrals/referral-history"
import { ReferralRewards } from "@/components/referrals/referral-rewards"

export default async function ReferralsPage() {
  const t = await getTranslations("ReferralsPage")
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const supabase = createClient()

  // Get user's referral code
  const { data: referralCode } = await supabase
    .from("referral_codes")
    .select("code")
    .eq("user_id", session.user.id)
    .single()

  // If user doesn't have a referral code yet, generate one
  let code = referralCode?.code
  if (!code) {
    code = await generateReferralCode(supabase, session.user.id)
  }

  // Get user's referrals
  const { data: referrals } = await supabase
    .from("referrals")
    .select(`
      id,
      status,
      reward_type,
      reward_amount,
      created_at,
      referred_id,
      users:referred_id (name, email, image)
    `)
    .eq("referrer_id", session.user.id)
    .order("created_at", { ascending: false })

  // Get user's rewards
  const { data: rewards } = await supabase
    .from("referral_rewards")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardShell>
      <DashboardHeader heading={t("title")} description={t("description")} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="history">{t("tabs.history")}</TabsTrigger>
          <TabsTrigger value="rewards">{t("tabs.rewards")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ReferralDashboard
            referralCode={code}
            referralsCount={referrals?.length || 0}
            rewardsCount={rewards?.length || 0}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <ReferralHistory referrals={referrals || []} />
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <ReferralRewards rewards={rewards || []} />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

// Helper function to generate a unique referral code
async function generateReferralCode(supabase: any, userId: string) {
  // Generate a random code
  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let code = ""
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  // Try to insert the code, retry if there's a conflict
  let code = generateCode()
  let success = false
  let attempts = 0

  while (!success && attempts < 5) {
    const { error } = await supabase.from("referral_codes").insert({ user_id: userId, code })

    if (!error) {
      success = true
    } else if (error.code === "23505") {
      // Unique violation
      code = generateCode()
      attempts++
    } else {
      console.error("Error generating referral code:", error)
      break
    }
  }

  return code
}
