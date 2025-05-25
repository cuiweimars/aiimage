"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Copy, Share2, Gift, Users } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SocialShareButtons } from "@/components/social-share-buttons"
import { Label } from "@/components/ui/label"

interface ReferralStats {
  totalReferrals: number
  successfulReferrals: number
  pendingReferrals: number
  referralCode: string
}

interface ReferralDashboardProps {
  stats: ReferralStats
}

export function ReferralDashboard({ stats }: ReferralDashboardProps) {
  const t = useTranslations("ReferralDashboard")
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/register?ref=${stats.referralCode}`
      : `/register?ref=${stats.referralCode}`

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(stats.referralCode)
      toast(t("codeCopied"))
    } catch (error) {
      console.error("Failed to copy code:", error)
      toast.error(t("copyFailed"))
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: t("shareTitle"),
        text: t("shareText", { code: stats.referralCode }),
      })
      toast(t("shareSuccess"))
    } catch (error) {
      console.error("Failed to share:", error)
      toast.error(t("shareFailed"))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("totalReferrals")}</p>
                <p className="text-2xl font-bold">{stats.totalReferrals}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("successfulReferrals")}</p>
                <p className="text-2xl font-bold">{stats.successfulReferrals}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("pendingReferrals")}</p>
                <p className="text-2xl font-bold">{stats.pendingReferrals}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t("yourCode")}</p>
              <div className="flex items-center gap-2">
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                  {stats.referralCode}
                </code>
                <Button variant="outline" size="sm" onClick={handleCopyCode}>
                  {t("copyCode")}
              </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  {t("share")}
              </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>{t("howItWorks.title")}</CardTitle>
          <CardDescription>{t("howItWorks.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </div>
              <div>
                <h4 className="font-medium">{t("howItWorks.step1.title")}</h4>
                <p className="text-sm text-muted-foreground">{t("howItWorks.step1.description")}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <div>
                <h4 className="font-medium">{t("howItWorks.step2.title")}</h4>
                <p className="text-sm text-muted-foreground">{t("howItWorks.step2.description")}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                3
              </div>
              <div>
                <h4 className="font-medium">{t("howItWorks.step3.title")}</h4>
                <p className="text-sm text-muted-foreground">{t("howItWorks.step3.description")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("shareReferral.title")}</DialogTitle>
            <DialogDescription>{t("shareReferral.description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("referralLink")}</Label>
              <div className="flex items-center justify-between rounded-md border p-2">
                <code className="text-sm truncate">{referralLink}</code>
                <Button variant="ghost" size="icon" onClick={handleCopyCode}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">{t("copyLink")}</span>
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("shareVia")}</Label>
              <SocialShareButtons url={referralLink} title={t("shareReferral.defaultText")} />
          </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button variant="secondary" onClick={() => setShareDialogOpen(false)}>
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
