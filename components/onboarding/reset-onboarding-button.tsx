"use client"

import { useTranslations } from "next-intl"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOnboarding } from "./onboarding-provider"

export function ResetOnboardingButton() {
  const t = useTranslations("Onboarding")
  const { resetOnboarding } = useOnboarding()

  return (
    <Button variant="outline" size="sm" onClick={resetOnboarding} className="gap-1">
      <RefreshCw className="h-3.5 w-3.5" />
      {t("resetTutorial")}
    </Button>
  )
}
