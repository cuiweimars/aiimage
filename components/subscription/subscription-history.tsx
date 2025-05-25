"use client"

import { useTranslations } from "next-intl"
import { Check, X, AlertCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { subscriptionPlans } from "@/lib/creem"

interface SubscriptionHistoryItem {
  id: string
  user_id: string
  subscription_id: string
  plan: string
  status: string
  event_type: string
  created_at: string
}

interface SubscriptionHistoryProps {
  history: SubscriptionHistoryItem[]
}

export function SubscriptionHistory({ history }: SubscriptionHistoryProps) {
  const t = useTranslations("SubscriptionHistory")

  // 格式化日期
  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // 获取事件类型的翻译
  // Get translation for event type
  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case "subscription_created":
        return t("eventTypes.created")
      case "subscription_updated":
        return t("eventTypes.updated")
      case "subscription_canceled":
        return t("eventTypes.canceled")
      case "subscription_deleted":
        return t("eventTypes.deleted")
      case "payment_succeeded":
        return t("eventTypes.paymentSucceeded")
      case "payment_failed":
        return t("eventTypes.paymentFailed")
      default:
        return eventType
    }
  }

  // 获取事件类型的变体
  // Get variant for event type
  const getEventTypeVariant = (eventType: string) => {
    switch (eventType) {
      case "subscription_created":
      case "subscription_updated":
      case "payment_succeeded":
        return "success" as const
      case "subscription_canceled":
      case "subscription_deleted":
        return "secondary" as const
      case "payment_failed":
        return "destructive" as const
      default:
        return "default" as const
    }
  }

  // 获取状态图标
  // Get status icon
  const getStatusIcon = (status: string) => {
    if (status === "active") {
      return <Check className="h-4 w-4 text-green-500" />
    }
    return <X className="h-4 w-4 text-red-500" />
  }

  // 获取计划名称
  // Get plan name
  const getPlanName = (planId: string) => {
    const plan = subscriptionPlans[planId as keyof typeof subscriptionPlans]
    if (plan) {
      return t(`plans.${planId}.name`)
    }
    return planId.charAt(0).toUpperCase() + planId.slice(1)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-8">
              {history.map((item) => (
                <div key={item.id} className="flex">
                  <div className="mr-4 flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-muted bg-background">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="h-full w-px bg-border" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center">
                      <Badge variant={getEventTypeVariant(item.event_type)}>{getEventTypeLabel(item.event_type)}</Badge>
                      <span className="ml-auto text-sm text-muted-foreground">{formatDate(item.created_at)}</span>
                    </div>
                    <p className="text-sm font-medium leading-none">
                      {t("planLabel")}: {getPlanName(item.plan)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("statusLabel")}: {item.status === "active" ? t("active") : t("inactive")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">{t("noHistory")}</div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("help.title")}</AlertTitle>
        <AlertDescription>{t("help.description")}</AlertDescription>
      </Alert>
    </div>
  )
}
