"use client"

import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ReferralHistoryProps {
  referrals: Array<{
    id: string
    status: string
    reward_type?: string
    reward_amount?: number
    created_at: string
    users: {
      name: string
      email: string
      image?: string
    }
  }>
}

export function ReferralHistory({ referrals }: ReferralHistoryProps) {
  const t = useTranslations("ReferralHistory")

  if (referrals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("noReferrals.title")}</CardTitle>
          <CardDescription>{t("noReferrals.description")}</CardDescription>
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
            {referrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between space-x-4 rounded-md border p-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={referral.users.image || ""} alt={referral.users.name} />
                    <AvatarFallback>{referral.users.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{referral.users.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("joinedOn", { date: format(new Date(referral.created_at), "PPP") })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getReferralStatusVariant(referral.status)}>{t(`status.${referral.status}`)}</Badge>
                  {referral.reward_type && referral.reward_amount && (
                    <div className="text-sm">
                      {t("reward", { type: t(`rewardTypes.${referral.reward_type}`), amount: referral.reward_amount })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getReferralStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "completed":
      return "default"
    case "rewarded":
      return "default"
    case "pending":
      return "secondary"
    default:
      return "outline"
  }
}
