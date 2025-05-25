"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useLocalStorage } from "@/hooks/use-local-storage"

type OnboardingStep = "welcome" | "ai-lab" | "prompt-writing" | "gallery" | "subscription" | "complete"

interface OnboardingState {
  isFirstVisit: boolean
  hasCompletedOnboarding: boolean
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]
  isOnboardingVisible: boolean
  showOnboarding: () => void
  hideOnboarding: () => void
  completeStep: (step: OnboardingStep) => void
  resetOnboarding: () => void
  skipOnboarding: () => void
}

const OnboardingContext = createContext<OnboardingState | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [isFirstVisit, setIsFirstVisit] = useLocalStorage("omnigen-first-visit", true)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage("omnigen-completed-onboarding", false)
  const [completedSteps, setCompletedSteps] = useLocalStorage<OnboardingStep[]>("omnigen-completed-steps", [])
  const [currentStep, setCurrentStep] = useLocalStorage<OnboardingStep>("omnigen-current-step", "welcome")
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false)

  // 当用户首次访问或登录时显示引导
  useEffect(() => {
    if (session && isFirstVisit && !hasCompletedOnboarding) {
      setIsOnboardingVisible(true)
      setIsFirstVisit(false)
    }
  }, [session, isFirstVisit, hasCompletedOnboarding, setIsFirstVisit])

  const showOnboarding = () => setIsOnboardingVisible(true)
  const hideOnboarding = () => setIsOnboardingVisible(false)

  const completeStep = (step: OnboardingStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step])
    }

    // 设置下一步
    const steps: OnboardingStep[] = ["welcome", "ai-lab", "prompt-writing", "gallery", "subscription", "complete"]
    const currentIndex = steps.indexOf(step)
    const nextStep = steps[currentIndex + 1]

    if (nextStep) {
      setCurrentStep(nextStep)
    } else {
      setHasCompletedOnboarding(true)
      hideOnboarding()
    }
  }

  const resetOnboarding = () => {
    setCompletedSteps([])
    setCurrentStep("welcome")
    setHasCompletedOnboarding(false)
    setIsOnboardingVisible(true)
  }

  const skipOnboarding = () => {
    setHasCompletedOnboarding(true)
    hideOnboarding()
  }

  return (
    <OnboardingContext.Provider
      value={{
        isFirstVisit,
        hasCompletedOnboarding,
        currentStep,
        completedSteps,
        isOnboardingVisible,
        showOnboarding,
        hideOnboarding,
        completeStep,
        resetOnboarding,
        skipOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}
