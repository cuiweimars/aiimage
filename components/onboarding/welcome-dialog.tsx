"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Sparkles, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useOnboarding } from "./onboarding-provider"

export function WelcomeDialog() {
  const t = useTranslations("Onboarding.Welcome")
  const { isOnboardingVisible, currentStep, completeStep, skipOnboarding } = useOnboarding()
  const [currentSlide, setCurrentSlide] = useState(0)

  const isVisible = isOnboardingVisible && currentStep === "welcome"

  const slides = [
    {
      title: t("slides.0.title"),
      description: t("slides.0.description"),
      image: "/placeholder.svg?height=200&width=400&text=Welcome+to+OmniGen+AI",
    },
    {
      title: t("slides.1.title"),
      description: t("slides.1.description"),
      image: "/placeholder.svg?height=200&width=400&text=Create+Amazing+Images",
    },
    {
      title: t("slides.2.title"),
      description: t("slides.2.description"),
      image: "/placeholder.svg?height=200&width=400&text=Share+Your+Creations",
    },
  ]

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      completeStep("welcome")
    }
  }

  return (
    <Dialog open={isVisible} onOpenChange={(open) => !open && skipOnboarding()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="relative overflow-hidden rounded-lg bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slides[currentSlide].image || "/placeholder.svg"}
              alt={slides[currentSlide].title}
              className="w-full h-[200px] object-cover"
            />
          </div>

          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold">{slides[currentSlide].title}</h3>
            <p className="text-sm text-muted-foreground">{slides[currentSlide].description}</p>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-1">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full ${
                    index === currentSlide ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={skipOnboarding}>
                {t("skip")}
              </Button>
              <Button onClick={handleNext} className="gap-1">
                {currentSlide < slides.length - 1 ? t("next") : t("getStarted")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
