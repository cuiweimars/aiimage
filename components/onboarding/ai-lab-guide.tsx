"use client"

import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Lightbulb, ArrowRight, X } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useOnboarding } from "./onboarding-provider"

export function AiLabGuide() {
  const t = useTranslations("Onboarding.AiLab")
  const pathname = usePathname()
  const { isOnboardingVisible, currentStep, completeStep } = useOnboarding()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 只在AI实验室页面显示此引导
    const shouldShow =
      isOnboardingVisible &&
      currentStep === "ai-lab" &&
      (pathname.includes("/ai-lab") || pathname.endsWith("/zh/ai-lab"))

    setIsVisible(shouldShow)
  }, [isOnboardingVisible, currentStep, pathname])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              {t("title")}
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => completeStep("ai-lab")}>
              <X className="h-4 w-4" />
              <span className="sr-only">{t("dismiss")}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-sm">
          <p>{t("description")}</p>
          <ul className="mt-2 space-y-1 list-disc pl-4">
            <li>{t("tips.0")}</li>
            <li>{t("tips.1")}</li>
            <li>{t("tips.2")}</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button size="sm" className="w-full gap-1" onClick={() => completeStep("ai-lab")}>
            {t("continue")}
            <ArrowRight className="h-3 w-3" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
