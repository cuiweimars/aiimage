"use client"

import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Lightbulb, ArrowRight, X, Check } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useOnboarding } from "./onboarding-provider"

export function PromptWritingGuide() {
  const t = useTranslations("Onboarding.PromptWriting")
  const pathname = usePathname()
  const { isOnboardingVisible, currentStep, completeStep } = useOnboarding()
  const [isVisible, setIsVisible] = useState(false)
  const [expandedTip, setExpandedTip] = useState<number | null>(null)

  useEffect(() => {
    // 只在AI实验室页面显示此引导
    const shouldShow =
      isOnboardingVisible &&
      currentStep === "prompt-writing" &&
      (pathname.includes("/ai-lab") || pathname.endsWith("/zh/ai-lab"))

    setIsVisible(shouldShow)
  }, [isOnboardingVisible, currentStep, pathname])

  if (!isVisible) return null

  const tips = [
    {
      title: t("tips.0.title"),
      description: t("tips.0.description"),
      examples: [t("tips.0.examples.0"), t("tips.0.examples.1")],
    },
    {
      title: t("tips.1.title"),
      description: t("tips.1.description"),
      examples: [t("tips.1.examples.0"), t("tips.1.examples.1")],
    },
    {
      title: t("tips.2.title"),
      description: t("tips.2.description"),
      examples: [t("tips.2.examples.0"), t("tips.2.examples.1")],
    },
  ]

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              {t("title")}
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => completeStep("prompt-writing")}>
              <X className="h-4 w-4" />
              <span className="sr-only">{t("dismiss")}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p>{t("description")}</p>

          <div className="space-y-2">
            {tips.map((tip, index) => (
              <div key={index} className="border rounded-md">
                <button
                  className="w-full flex items-center justify-between p-2 text-left"
                  onClick={() => setExpandedTip(expandedTip === index ? null : index)}
                >
                  <span className="font-medium">{tip.title}</span>
                  {expandedTip === index ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </button>
                {expandedTip === index && (
                  <div className="p-2 pt-0 border-t">
                    <p className="text-muted-foreground text-xs">{tip.description}</p>
                    <div className="mt-1 space-y-1">
                      {tip.examples.map((example, i) => (
                        <div key={i} className="bg-muted p-1 rounded text-xs">
                          {example}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button size="sm" className="w-full gap-1" onClick={() => completeStep("prompt-writing")}>
            {t("gotIt")}
            <Check className="h-3 w-3" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
