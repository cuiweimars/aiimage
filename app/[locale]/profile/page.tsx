"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Crown, Zap, CheckCircle, EyeOff, ShieldCheck } from "lucide-react"
import UpgradeButton from "@/components/UpgradeButton"
import UpgradeNowButton from "@/components/UpgradeNowButton"

export default function ProfilePage() {
  const t = useTranslations()
  const tProfile = useTranslations('ProfilePage')
  const tSubscribe = useTranslations('SubscribePage')
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user')
      .then(res => {
        if (res.status === 401) {
          router.push('/login')
          return null
        }
        return res.json()
      })
      .then(data => {
        if (data) setUser(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching user:', error)
        setLoading(false)
      })
  }, [router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">未获取到用户信息</div>
  }

  const subscription = user.subscription
  const isSubscribed = subscription?.status === 'active'
  const plan = subscription?.plan || 'free'

  // 权益内容定义
  const planRights: Record<string, { name: string; rights: string[] }> = {
    free: {
      name: tSubscribe('plans.free.name', { defaultValue: 'Free' }),
      rights: [
        'Unlimited image generation',
        'Fast generation',
        'No login required',
        '100% free',
      ],
    },
    basic: {
      name: tSubscribe('plans.basic.name', { defaultValue: 'Basic' }),
      rights: [
        tSubscribe('plans.basic.features.0'),
        tSubscribe('plans.basic.features.1'),
        tSubscribe('plans.basic.features.2'),
        tSubscribe('plans.basic.features.3'),
        tSubscribe('plans.basic.features.4'),
      ],
    },
    ultimate: {
      name: tSubscribe('plans.ultimate.name', { defaultValue: 'Ultimate' }),
      rights: [
        tSubscribe('plans.ultimate.features.0'),
        tSubscribe('plans.ultimate.features.1'),
        tSubscribe('plans.ultimate.features.2'),
        tSubscribe('plans.ultimate.features.3'),
        tSubscribe('plans.ultimate.features.4'),
        tSubscribe('plans.ultimate.features.5'),
        tSubscribe('plans.ultimate.features.6'),
        tSubscribe('plans.ultimate.features.7'),
        tSubscribe('plans.ultimate.features.8'),
      ],
    },
  }

  // 升级路径
  const upgradeMap: Record<string, string> = {
    free: 'basic',
    basic: 'ultimate',
    ultimate: '',
  }
  const nextPlan = upgradeMap[plan] || ''

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{tProfile('title')}</h1>
        
        {/* 用户基本信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{tProfile('baseInfo')}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-gray-600 dark:text-gray-400">{tProfile('email')}</label>
              <p className="font-medium">{user.email}</p>
        </div>
            <div>
              <label className="text-gray-600 dark:text-gray-400">{tProfile('username')}</label>
              <p className="font-medium">{user.name}</p>
      </div>
          </div>
          </div>

        {/* 订阅信息分栏 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col md:flex-row gap-8">
          {/* 当前套餐 */}
          <div className="flex-1 border-r border-gray-200 dark:border-gray-700 pr-0 md:pr-8">
            <h2 className="text-xl font-semibold mb-4">{tProfile('currentPlanLabel')}：{planRights[plan]?.name}</h2>
            <ul className="space-y-2">
              {planRights[plan]?.rights.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* 可升级套餐 */}
          {/*
          {nextPlan && (
            <div className="flex-1 flex flex-col items-start">
              <h2 className="text-xl font-semibold mb-4">可升级至：{planRights[nextPlan].name}</h2>
              <ul className="space-y-2 mb-6">
                {planRights[nextPlan].rights.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <UpgradeNowButton>{t('upgradeNow')} →</UpgradeNowButton>
            </div>
          )}
          */}
          {/* 已是最高级套餐 */}
          {!nextPlan && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-green-500 font-bold text-lg">{tProfile('maxPlanTip')}</div>
          </div>
          )}
        </div>
      </div>
    </div>
  )
} 