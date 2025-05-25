"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Zap, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface QuotaDisplayProps {
  plan: string
  quota: {
    daily: number
    used: {
      today: number
      month: number
      total: number
    }
    remaining: number
  }
  className?: string
}

export function QuotaDisplay({ plan, quota, className }: QuotaDisplayProps) {
  const t = useTranslations("QuotaDisplay")
  const router = useRouter()

  // 计算配额使用百分比
  // Calculate quota usage percentage
  const usagePercent = Math.min(100, (quota.used.today / quota.daily) * 100)

  // 确定进度条颜色
  // Determine progress bar color
  const getProgressColor = () => {
    if (usagePercent >= 90) return "bg-destructive"
    if (usagePercent >= 70) return "bg-warning"
    return "bg-primary"
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium">{t("dailyQuota")}</span>
            </div>
            <div className="text-sm font-medium">
              {quota.used.today} / {quota.daily}
            </div>
          </div>
          <Progress value={usagePercent} className="h-2" indicatorClassName={getProgressColor()} />
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-muted-foreground">{t("plan", { plan: t(`plans.${plan}`) })}</div>
            <div className="text-xs">
              {usagePercent >= 90 ? (
                <span className="text-destructive font-medium">{t("almostDepleted")}</span>
              ) : (
                <span>{t("remaining", { count: quota.remaining })}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {usagePercent >= 90 && plan !== "ultimate" && (
        <Alert variant="warning" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("alert.title")}</AlertTitle>
          <AlertDescription className="flex items-center">
            {t("alert.description")}
            <Button variant="link" className="h-auto p-0 ml-1" onClick={() => router.push("/pricing")}>
              {t("alert.action")}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
