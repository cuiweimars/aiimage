"use client"

import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { Gift } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ReferralRewardsProps {
  rewards: Array<{
    id: string
    reward_type: string
    reward_amount: number
    description?: string
    created_at: string
  }>
}

export function ReferralRewards({ rewards }: ReferralRewardsProps) {
  const t = useTranslations("ReferralRewards")

  if (rewards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("noRewards.title")}</CardTitle>
          <CardDescription>{t("noRewards.description")}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between space-x-4 rounded-md border p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {t("rewardAmount", {
                        type: t(`rewardTypes.${reward.reward_type}`),
                        amount: reward.reward_amount,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">{reward.description || t("defaultDescription")}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{format(new Date(reward.created_at), "PPP")}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
