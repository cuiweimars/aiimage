"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

export default function SubscribePage() {
  const t = useTranslations("SubscribePage")
  const { data: session, status } = useSession()
  const [interval, setInterval] = useState<'month'|'year'>('month')
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const userPlan = (session?.user as any)?.plan || 'guest'
  const subscriptionStatus = (session?.user as any)?.subscription_status
  const subscriptionExpiry = (session?.user as any)?.subscription_expiry

  const PLANS = [
    {
      key: "basic",
      name: t("plans.basic.name"),
      features: [
        t("plans.basic.features.0"),
        t("plans.basic.features.1"),
        t("plans.basic.features.2"),
        t("plans.basic.features.3"),
        t("plans.basic.features.4"),
      ],
      price: { month: 9.9, year: 7.9 },
    },
    {
      key: "pro",
      name: t("plans.pro.name"),
      features: [
        t("plans.pro.features.0"),
        t("plans.pro.features.1"),
        t("plans.pro.features.2"),
        t("plans.pro.features.3"),
        t("plans.pro.features.4"),
      ],
      price: { month: 12.9, year: 9.9 },
    },
  ]

  const handleSubscribe = async (plan: 'basic'|'pro') => {
    if (!session?.user) {
      router.push('/api/auth/signin?callbackUrl=/subscribe')
      return
    }
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, interval })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || t("errors.createSessionFailed"))
      }
    } catch (e) {
      alert(t("errors.network"))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      <div className="mb-4">
        <button
          className={`px-4 py-2 rounded-l bg-${interval==='month'?'primary':'muted'} text-white`}
          onClick={()=>setInterval('month')}
        >{t("billing.month")}</button>
        <button
          className={`px-4 py-2 rounded-r bg-${interval==='year'?'primary':'muted'} text-white`}
          onClick={()=>setInterval('year')}
        >{t("billing.year")}</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLANS.map(plan => (
          <div key={plan.key} className={`border rounded-xl p-6 shadow ${userPlan===plan.key?'border-primary':''}`}>
            <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
            <div className="text-3xl font-bold mb-2">￥{plan.price[interval]}/{t("billing.perMonth")}</div>
            <ul className="mb-4 text-sm text-muted-foreground">
              {plan.features.map(f=>(<li key={f}>• {f}</li>))}
            </ul>
            {userPlan===plan.key && subscriptionStatus==='active' ? (
              <div className="text-green-600 font-bold">{t("currentSubscribed", { plan: plan.name, expiry: subscriptionExpiry?new Date(subscriptionExpiry).toLocaleDateString():'--' })}</div>
            ) : (
              <button
                className="bg-primary text-white px-6 py-2 rounded disabled:opacity-60"
                disabled={!!loading}
                onClick={()=>handleSubscribe(plan.key as 'basic'|'pro')}
              >{loading===plan.key?t("jumping"):t("subscribe", { plan: plan.name })}</button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 text-xs text-muted-foreground">
        {t("tips.autoActive")}
      </div>
    </div>
  )
} 