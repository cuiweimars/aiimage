import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FAQ } from "@/components/faq"

export default async function PricingPage() {
  const t = await getTranslations("PricingPage")

  const plans = [
    {
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
      cta: t("plans.basic.cta"),
      popular: false,
    },
    {
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
      cta: t("plans.ultimate.cta"),
      popular: true,
    },
    {
      name: t("plans.enterprise.name"),
      description: t("plans.enterprise.description"),
      price: {
        monthly: t("plans.enterprise.price"),
        yearly: t("plans.enterprise.price"),
      },
      features: [
        t("plans.enterprise.features.0"),
        t("plans.enterprise.features.1"),
        t("plans.enterprise.features.2"),
        t("plans.enterprise.features.3"),
        t("plans.enterprise.features.4"),
      ],
      cta: t("plans.enterprise.cta"),
      popular: false,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-12 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              {t("hero.title")}
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">{t("hero.subtitle")}</p>
          </div>

          <div className="flex justify-center mb-8">
            <Tabs defaultValue="monthly" className="w-full max-w-4xl">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="monthly">{t("billing.monthly")}</TabsTrigger>
                <TabsTrigger value="yearly">
                  {t("billing.yearly")} <span className="ml-1 text-xs font-normal text-primary">{t("billing.discount")}</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="monthly" className="mt-8">
                <div className="grid gap-6 md:grid-cols-3 justify-center">
                  {plans.map((plan, index) => (
                    <Card
                      key={index}
                      className={`flex flex-col h-full w-[744px] ${plan.popular ? "border-primary shadow-md" : ""}`}
                    >
                      {plan.popular && (
                        <div className="px-3 py-1 text-xs font-semibold text-primary-foreground bg-primary w-fit rounded-full mx-auto -mt-3 z-10">
                          {t("popular")}
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="mt-4">
                          {plan.price.monthly === t("plans.enterprise.price") ? (
                            <span className="text-xl font-semibold text-center whitespace-nowrap block">{plan.price.monthly}</span>
                          ) : (
                            <>
                              <span className="text-4xl font-bold whitespace-nowrap">{plan.price.monthly}</span>
                              <span className="text-muted-foreground ml-1 whitespace-nowrap">{t("perMonth")}</span>
                            </>
                          )}
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
                        <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                          <Link href="/register">{plan.cta}</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="yearly" className="mt-8">
                <div className="grid gap-6 md:grid-cols-3 justify-center">
                  {plans.map((plan, index) => (
                    <Card
                      key={index}
                      className={`flex flex-col h-full w-[420px] ${plan.popular ? "border-primary shadow-md" : ""}`}
                    >
                      {plan.popular && (
                        <div className="px-3 py-1 text-xs font-semibold text-primary-foreground bg-primary w-fit rounded-full mx-auto -mt-3 z-10">
                          {t("popular")}
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="mt-4">
                          {plan.price.yearly === t("plans.enterprise.price") ? (
                            <span className="text-xl font-semibold text-center whitespace-nowrap block">{plan.price.yearly}</span>
                          ) : (
                            <>
                              <span className="text-4xl font-bold whitespace-nowrap">{plan.price.yearly}</span>
                              <span className="text-muted-foreground ml-1 whitespace-nowrap">{t("perYear")}</span>
                            </>
                          )}
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
                        <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                          <Link href="/register">{plan.cta}</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <FAQ />
    </div>
  )
}
