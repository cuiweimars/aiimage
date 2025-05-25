"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Calendar, Clock, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"

interface Subscription {
  id: string
  user_id: string
  plan: string
  status: string
  current_period_end: string
  created_at: string
}

interface SubscriptionUsageProps {
  subscription: Subscription | null
  todayUsage: number
  monthlyUsage: number
}

interface UsageData {
  date: string
  count: number
}

export function SubscriptionUsage({ subscription, todayUsage, monthlyUsage }: SubscriptionUsageProps) {
  const t = useTranslations("SubscriptionUsage")
  const router = useRouter()
  const [weeklyUsage, setWeeklyUsage] = useState<UsageData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 确定当前计划和配额
  // Determine current plan and quota
  const currentPlan = subscription?.plan || "free"
  const isActive = subscription?.status === "active"

  // 获取过去7天的使用数据
  // Get usage data for the past 7 days
  useEffect(() => {
    async function fetchWeeklyUsage() {
      setIsLoading(true)
      try {
        const supabase = createClient()

        // 获取过去7天的日期
        // Get dates for the past 7 days
        const dates = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          dates.push(date.toISOString().split("T")[0])
        }

        // 初始化数据结构
        // Initialize data structure
        const usageData = dates.map((date) => ({ date, count: 0 }))

        // 获取过去7天的图像生成数据
        // Get image generation data for the past 7 days
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 6)
        startDate.setHours(0, 0, 0, 0)

        const { data, error } = await supabase
          .from("images")
          .select("created_at")
          .gte("created_at", startDate.toISOString())

        if (error) {
          console.error("Error fetching weekly usage:", error)
          return
        }

        // 计算每天的图像数量
        // Calculate image count for each day
        if (data) {
          data.forEach((item) => {
            const date = new Date(item.created_at).toISOString().split("T")[0]
            const index = usageData.findIndex((d) => d.date === date)
            if (index !== -1) {
              usageData[index].count++
            }
          })
        }

        setWeeklyUsage(usageData)
      } catch (error) {
        console.error("Error fetching weekly usage:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeeklyUsage()
  }, [])

  const handleUpgrade = () => {
    router.push("/pricing")
  }

  // 格式化图表日期
  // Format chart dates
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }).split(",")[0]
  }

  // 计算平均每日使用量
  // Calculate average daily usage
  const averageDailyUsage =
    weeklyUsage.length > 0 ? Math.round(weeklyUsage.reduce((sum, item) => sum + item.count, 0) / weeklyUsage.length) : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="mr-2 h-4 w-4 text-primary" />
              {t("cards.daily.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayUsage} / {dailyQuota}
            </div>
            <Progress value={dailyUsagePercent} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {dailyUsagePercent >= 80 ? (
                <span className="text-amber-500">{t("cards.daily.almostReached")}</span>
              ) : (
                t("cards.daily.remaining", { count: dailyQuota - todayUsage })
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              {t("cards.monthly.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyUsage}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("cards.monthly.description")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4 text-primary" />
              {t("cards.average.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDailyUsage}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("cards.average.description")}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("weeklyChart.title")}</CardTitle>
          <CardDescription>{t("weeklyChart.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] w-full flex items-center justify-center">
              <p className="text-muted-foreground">{t("loading")}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyUsage}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [value, t("weeklyChart.images")]}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                  {weeklyUsage.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.count >= dailyQuota ? "var(--destructive)" : "var(--primary)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="outline" onClick={handleUpgrade} disabled={currentPlan === "ultimate"}>
            {t("upgradeForMore")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
