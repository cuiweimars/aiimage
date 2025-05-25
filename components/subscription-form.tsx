"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Check, Crown } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Subscription {
  id: string
  user_id: string
  plan: string
  status: string
  current_period_end: string
  created_at: string
}

interface SubscriptionFormProps {
  subscription: Subscription | null
  onSuccess?: () => void
}

export function SubscriptionForm({ subscription, onSuccess }: SubscriptionFormProps) {
  const t = useTranslations("SubscriptionForm")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [tabValue, setTabValue] = useState("monthly")

  const plans = [
    {
      id: "basic",
      name: t("plans.basic.name"),
      description: t("plans.basic.description"),
      price: {
        monthly: "$12",
        yearly: "$120",
      },
      features: [
        t("plans.basic.features.0"),
        t("plans.basic.features.1"),
        t("plans.basic.features.2"),
        t("plans.basic.features.3"),
      ],
      cta: subscription?.plan === "basic" ? t("plans.current") : t("plans.upgrade"),
      current: subscription?.plan === "basic",
    },
    {
      id: "ultimate",
      name: t("plans.ultimate.name"),
      description: t("plans.ultimate.description"),
      price: {
        monthly: "$24",
        yearly: "$240",
      },
      features: [
        t("plans.ultimate.features.0"),
        t("plans.ultimate.features.1"),
        t("plans.ultimate.features.2"),
        t("plans.ultimate.features.3"),
        t("plans.ultimate.features.4"),
        t("plans.ultimate.features.5"),
        t("plans.ultimate.features.6"),
      ],
      cta: subscription?.plan === "ultimate" ? t("plans.current") : t("plans.upgrade"),
      current: subscription?.plan === "ultimate",
      popular: true,
    },
  ]

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/subscriptions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billingCycle: tabValue })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create checkout session")
      }
      const { url } = await response.json()
      window.location.href = url // 跳转到Paddle结账页
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error(t("errors.title"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/subscriptions/create-portal", {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create customer portal")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error("Customer portal error:", error)
      toast.error(t("errors.title"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {subscription && (
        <div className="rounded-md bg-muted p-4">
          <div className="flex items-center gap-4">
            <Crown className="h-6 w-6 text-primary" />
            <div>
              <h4 className="font-medium">
                {t("currentPlan", { plan: subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) })}
              </h4>
              <p className="text-sm text-muted-foreground">
                {subscription.status === "active"
                  ? t("renewsOn", {
                      date: new Date(subscription.current_period_end).toLocaleDateString(),
                    })
                  : t("inactive")}
              </p>
            </div>
            <Button variant="outline" className="ml-auto" onClick={handleManageSubscription} disabled={isLoading}>
              {t("manageSubscription")}
            </Button>
          </div>
        </div>
      )}

      <Tabs defaultValue="monthly" className="w-full" value={tabValue} onValueChange={setTabValue}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
          <TabsTrigger value="monthly">{t("billing.monthly")}</TabsTrigger>
          <TabsTrigger value="yearly">
            {t("billing.yearly")} <span className="ml-1 text-xs font-normal text-primary">{t("billing.discount")}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="monthly" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <Card key={plan.id} className={`flex flex-col ${plan.popular ? "border-primary shadow-md" : ""}`}>
                {plan.popular && (
                  <div className="px-3 py-1 text-xs font-semibold text-primary-foreground bg-primary w-fit rounded-full mx-auto -mt-3 z-10">
                    {t("popular")}
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price.monthly}</span>
                    <span className="text-muted-foreground ml-1">{t("perMonth")}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
                    disabled={plan.current || isLoading}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {plan.current ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        {plan.cta}
                      </>
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="yearly" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <Card key={plan.id} className={`flex flex-col ${plan.popular ? "border-primary shadow-md" : ""}`}>
                {plan.popular && (
                  <div className="px-3 py-1 text-xs font-semibold text-primary-foreground bg-primary w-fit rounded-full mx-auto -mt-3 z-10">
                    {t("popular")}
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price.yearly}</span>
                    <span className="text-muted-foreground ml-1">{t("perYear")}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
                    disabled={plan.current || isLoading}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {plan.current ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        {plan.cta}
                      </>
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
