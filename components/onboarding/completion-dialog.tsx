"use client"

import { useTranslations } from "next-intl"
import { Award, Check, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useOnboarding } from "./onboarding-provider"

export function CompletionDialog() {
  const t = useTranslations("Onboarding.Completion")
  const { isOnboardingVisible, currentStep, completeStep } = useOnboarding()

  const isVisible = isOnboardingVisible && currentStep === "complete"

  return (
    <Dialog open={isVisible} onOpenChange={(open) => !open && completeStep("complete")}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{t("whatYouLearned")}</h3>
              <ul className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{t(`learningPoints.${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{t("nextSteps.title")}</h3>
              <p className="text-sm text-muted-foreground">{t("nextSteps.description")}</p>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={() => completeStep("complete")} className="w-full">
              {t("startCreating")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
