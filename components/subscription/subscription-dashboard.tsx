"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Check, Crown, AlertCircle, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

interface Subscription {
  id: string
  user_id: string
  plan: string
  status: string
  current_period_end: string
  created_at: string
}

interface SubscriptionDashboardProps {
  subscription: Subscription | null
  todayUsage: number
  monthlyUsage: number
}

export function SubscriptionDashboard({ subscription, todayUsage, monthlyUsage }: SubscriptionDashboardProps) {
  const t = useTranslations("SubscriptionDashboard")
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // 确定当前计划和配额
  // Determine current plan and quota
  const currentPlan = subscription?.plan || "free"
  const isActive = subscription?.status === "active"

  // 计算配额使用百分比
  // Calculate quota usage percentage
  const dailyQuota = 100 // Assuming a default dailyQuota
  const dailyUsagePercent = Math.min(100, (todayUsage / dailyQuota) * 100)

  // 计算剩余天数
  // Calculate days remaining
  const daysRemaining = subscription
    ? Math.max(
        0,
        Math.ceil((new Date(subscription.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      )
    : 0

  const handleManageSubscription = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/subscriptions/create-portal", {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create customer portal")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error("Customer portal error:", error)
      toast({
        title: t("errors.title"),
        description: error instanceof Error ? error.message : t("errors.unknown"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = () => {
    router.push("/pricing")
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Crown className="mr-2 h-5 w-5 text-primary" />
              {t("currentPlan.title")}
            </CardTitle>
            <CardDescription>{t("currentPlan.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {t(`plans.${currentPlan}.name`)}
                    {isActive && <span className="ml-2 text-xs font-normal text-green-500">{t("active")}</span>}
                    {subscription && !isActive && (
                      <span className="ml-2 text-xs font-normal text-red-500">{t("inactive")}</span>
                    )}
                  </div>
                  {subscription && (
                    <div className="text-sm text-muted-foreground">
                      {daysRemaining > 0 ? t("daysRemaining", { count: daysRemaining }) : t("expired")}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t(`plans.${currentPlan}.description`)}</p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">{t("features")}</div>
                <ul className="space-y-2">
                  {t(`plans.${currentPlan}.features`).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {subscription ? (
              <Button className="w-full" onClick={handleManageSubscription} disabled={isLoading}>
                {t("manageSubscription")}
              </Button>
            ) : (
              <Button className="w-full" onClick={handleUpgrade}>
                {t("upgrade")}
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5 text-primary" />
              {t("quotaUsage.title")}
            </CardTitle>
            <CardDescription>{t("quotaUsage.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{t("quotaUsage.daily")}</span>
                  <span className="font-medium">
                    {todayUsage} / {dailyQuota}
                  </span>
                </div>
                <Progress value={dailyUsagePercent} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {dailyUsagePercent >= 80 ? (
                    <span className="text-amber-500">{t("quotaUsage.almostReached")}</span>
                  ) : (
                    t("quotaUsage.remaining", { count: dailyQuota - todayUsage })
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">{t("quotaUsage.stats.title")}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("quotaUsage.stats.today")}</p>
                    <p className="text-2xl font-bold">{todayUsage}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("quotaUsage.stats.month")}</p>
                    <p className="text-2xl font-bold">{monthlyUsage}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" onClick={handleUpgrade} disabled={currentPlan === "ultimate"}>
              {t("increaseQuota")}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {dailyUsagePercent >= 90 && currentPlan !== "ultimate" && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("quotaAlert.title")}</AlertTitle>
          <AlertDescription>
            {t("quotaAlert.description")}
            <Button variant="link" className="h-auto p-0 ml-1" onClick={handleUpgrade}>
              {t("quotaAlert.action")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {subscription && !isActive && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("inactiveAlert.title")}</AlertTitle>
          <AlertDescription>
            {t("inactiveAlert.description")}
            <Button variant="link" className="h-auto p-0 ml-1 text-white" onClick={handleManageSubscription}>
              {t("inactiveAlert.action")}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
