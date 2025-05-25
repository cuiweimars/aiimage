"use client"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const FAQ = dynamic(() => import("@/components/faq").then(mod => mod.FAQ), { ssr: false })

export default function PricingPage() {
  const t = useTranslations("PricingPage")
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const userPlan = (session?.user as any)?.plan || 'guest'
  const [interval, setInterval] = useState<'monthly'|'yearly'>('monthly')
  const handleSubscribe = async (planKey: 'basic'|'pro') => {
    if (!session?.user) {
      router.push('/api/auth/signin?callbackUrl=/zh/pricing')
      return
    }
    setLoading(planKey)
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, interval: interval === 'monthly' ? 'month' : 'year' })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || '创建支付会话失败')
      }
    } catch (e) {
      alert('网络错误')
    } finally {
      setLoading(null)
    }
  }

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
    <div className="flex flex-col min-h-screen bg-[#18120b]">
      <section className="py-12 md:py-24 flex flex-col items-center relative overflow-hidden">
        {/* 竖向大弧形背景 */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 z-0" style={{ height: '900px', width: '1100px' }}>
          <svg width="1100" height="900" viewBox="0 0 1100 900" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M550 0C900 0 1100 180 1100 450C1100 720 900 900 550 900C200 900 0 720 0 450C0 180 200 0 550 0Z" fill="#221a13"/>
          </svg>
        </div>
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center relative z-10" style={{ minHeight: '700px' }}>
          <p className="text-[#b6a089] text-lg text-center mb-8 mt-2">{t("hero.subtitle")}</p>
          {/* 横排套餐卡片组 */}
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 w-full relative z-10">
            {plans.map((plan, index) => (
              <div key={index} className={`relative flex flex-col items-center justify-between w-full max-w-sm px-8 ${plan.popular ? "pt-16 pb-12 scale-105 z-20 border-4 border-[#bfa16b] shadow-2xl bg-[#251c15]" : "py-12 border-2 border-[#3a2e22] shadow-lg bg-[#221a13]"} rounded-3xl mx-auto transition-transform duration-300 ${plan.popular ? '' : 'mt-8 md:mt-0'}`}>
                {plan.popular && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold text-[#251c15] bg-[#bfa16b] rounded-full shadow-lg whitespace-nowrap">{t("popular")}</div>
                )}
                <div className="flex flex-col items-center justify-center mb-4">
                  <div className="text-2xl font-extrabold text-[#ffe0b2] tracking-wide mb-2">{plan.name}</div>
                  <div className="text-[#b6a089] text-base text-center mb-4">{plan.description}</div>
                </div>
                {plan.name.includes('企业') ? (
                  <>
                    <div className="text-3xl font-extrabold text-[#ffe0b2] mb-2 mt-2">联系我们</div>
                    <div className="text-[#b6a089] text-base text-center mb-6">自定义额度 专属支持 SLA与合规 团队管理 定制集成</div>
                    <Button asChild className={`w-full h-12 text-lg rounded-xl font-extrabold mt-2 ${plan.popular ? "bg-[#bfa16b] text-white hover:bg-[#cbb278]" : "border border-[#bfa16b] text-[#ffe0b2] bg-[#251c15] hover:bg-[#2d241b]"}`} variant="ghost">
                      <Link href="/contact">{plan.cta}</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-end mb-6">
                      <span className="text-5xl font-extrabold text-[#ffe0b2]">{plan.price.monthly}</span>
                      <span className="text-[#b6a089] text-xl font-medium ml-2 mb-1">{t("perMonth")}</span>
                    </div>
                    <ul className="flex flex-col items-start gap-2 mb-8 w-full">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-[#ffe0b2] text-lg pl-2">
                          <Check className="mr-2 h-5 w-5 text-[#bfa16b]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {plan.name.includes('企业') ? (
                      <Button asChild className={`w-full h-12 text-lg rounded-xl font-extrabold mt-2 ${plan.popular ? "bg-[#bfa16b] text-white hover:bg-[#cbb278]" : "border border-[#bfa16b] text-[#ffe0b2] bg-[#251c15] hover:bg-[#2d241b]"}`} variant="ghost">
                        <Link href="/contact">{plan.cta}</Link>
                      </Button>
                    ) : (
                      <Button
                        className={`w-full h-12 text-lg rounded-xl font-extrabold mt-2 ${plan.popular ? "bg-[#bfa16b] text-white hover:bg-[#cbb278]" : "border border-[#bfa16b] text-[#ffe0b2] bg-[#251c15] hover:bg-[#2d241b]"}`}
                        variant="ghost"
                        disabled={!!loading}
                        onClick={() => handleSubscribe(index === 0 ? 'basic' : 'pro')}
                      >{loading === (index === 0 ? 'basic' : 'pro') ? '跳转中...' : plan.cta}</Button>
                    )}
                    {/* 订阅状态提示 */}
                    {userPlan === (index === 0 ? 'basic' : 'pro') && (
                      <div className="text-green-600 font-bold text-center mt-2">你已是{plan.name}会员</div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <FAQ />
    </div>
  )
}
