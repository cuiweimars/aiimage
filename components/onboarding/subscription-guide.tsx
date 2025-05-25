"use client"

import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowRight, X, Zap } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useOnboarding } from "./onboarding-provider"

export function SubscriptionGuide() {
  const t = useTranslations("Onboarding.Subscription")
  const pathname = usePathname()
  const { isOnboardingVisible, currentStep, completeStep } = useOnboarding()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 只在订阅页面显示此引导
    const shouldShow =
      isOnboardingVisible &&
      currentStep === "subscription" &&
      (pathname.includes("/subscription") || pathname.includes("/pricing"))

    setIsVisible(shouldShow)
  }, [isOnboardingVisible, currentStep, pathname])

  if (!isVisible) return null

  return (
    <div className="fixed top-20 left-4 z-50 max-w-sm">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              {t("title")}
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => completeStep("subscription")}>
              <X className="h-4 w-4" />
              <span className="sr-only">{t("dismiss")}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-sm">
          <p>{t("description")}</p>
          <div className="mt-3 space-y-2">
            <div className="bg-muted p-2 rounded-md">
              <h4 className="font-medium">{t("plans.free.title")}</h4>
              <p className="text-xs text-muted-foreground">{t("plans.free.description")}</p>
            </div>
            <div className="bg-muted p-2 rounded-md">
              <h4 className="font-medium">{t("plans.basic.title")}</h4>
              <p className="text-xs text-muted-foreground">{t("plans.basic.description")}</p>
            </div>
            <div className="bg-primary/10 p-2 rounded-md border border-primary/20">
              <h4 className="font-medium">{t("plans.ultimate.title")}</h4>
              <p className="text-xs text-muted-foreground">{t("plans.ultimate.description")}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="sm" className="w-full gap-1" onClick={() => completeStep("subscription")}>
            {t("continue")}
            <ArrowRight className="h-3 w-3" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
