"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { SUBSCRIPTION_PLANS } from '@/lib/config'
import Script from 'next/script'

declare global {
  interface Window {
    Paddle: {
      Setup: (config: { token: string }) => void;
      Environment: {
        set: (env: 'sandbox' | 'production') => void;
      };
      Checkout: {
        open: (config: {
          items: Array<{ priceId: string }>;
          successUrl: string;
          cancelUrl: string;
          eventCallback?: (data: any) => void;
        }) => void;
      };
    };
  }
}

// 顶层读取价格环境变量
const PRO_MONTH = Number(process.env.NEXT_PUBLIC_SUBSCRIBE_PRO_MONTH) || 12
const PRO_YEAR = Number(process.env.NEXT_PUBLIC_SUBSCRIBE_PRO_YEAR) || 10
const ULTIMATE_MONTH = Number(process.env.NEXT_PUBLIC_SUBSCRIBE_ULTIMATE_MONTH) || 25
const ULTIMATE_YEAR = Number(process.env.NEXT_PUBLIC_SUBSCRIBE_ULTIMATE_YEAR) || 20
const ENTERPRISE_MONTH = Number(process.env.NEXT_PUBLIC_SUBSCRIBE_ENTERPRISE_MONTH) || null
const ENTERPRISE_YEAR = Number(process.env.NEXT_PUBLIC_SUBSCRIBE_ENTERPRISE_YEAR) || null
const BASIC_MONTH = Number(process.env.NEXT_PUBLIC_SUBSCRIBE_BASIC_MONTH) || 12
const BASIC_YEAR = Number(process.env.NEXT_PUBLIC_SUBSCRIBE_BASIC_YEAR) || 10

export default function SubscribePage() {
  const t = useTranslations("SubscribePage")
  const { data: session, status } = useSession()
  const [interval, setInterval] = useState<'month'|'year'>('year')
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const userPlan = (session?.user as any)?.plan || 'guest'
  const subscriptionStatus = (session?.user as any)?.subscription_status
  const subscriptionExpiry = (session?.user as any)?.subscription_expiry

  // 订阅成功后自动跳转到个人资料页并刷新
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams?.get('success') === 'true') {
      // 跳转到个人资料页并强制刷新，确保订阅信息是最新的
      router.push('/zh/profile');
      setTimeout(() => { window.location.reload(); }, 500);
    }
  }, [searchParams, router]);

  useEffect(() => {
    const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    
    const setupPaddle = () => {
      if (typeof window !== 'undefined' && window.Paddle) {
        // 检查 token 格式
        if (!clientToken) {
          console.error('Paddle client token is missing! 请检查环境变量 NEXT_PUBLIC_PADDLE_CLIENT_TOKEN');
          return;
        }
        
        if (!clientToken.startsWith('test_') && !clientToken.startsWith('live_')) {
          console.error('Invalid Paddle client token format! Token 必须以 test_ 或 live_ 开头');
          return;
        }

        // 设置环境（仅在 sandbox 时设置）
        const isSandbox = clientToken.startsWith('test_');
        if (isSandbox) {
          window.Paddle.Environment.set('sandbox');
        }
        
        // 初始化 Paddle（只传 token）
        window.Paddle.Setup({
          token: clientToken
        });
        
        console.log('Paddle.js initialized successfully', {
          environment: isSandbox ? 'sandbox' : 'production',
          tokenPrefix: clientToken.substring(0, 5)
        });
      } else {
        console.warn('Paddle.js not loaded yet');
      }
    };

    // 检查 Paddle.js 是否已加载
    if (window.Paddle) {
      setupPaddle();
    } else {
      const interval = window.setInterval(() => {
        if (window.Paddle) {
          setupPaddle();
          clearInterval(interval);
        }
      }, 200);
      
      // 5秒后停止检查
      window.setTimeout(() => {
        clearInterval(interval);
        if (!window.Paddle) {
          console.error('Paddle.js failed to load after 5 seconds');
        }
      }, 5000);
    }
  }, []);

  // 新套餐结构，三栏，支持标签、节省提示、勾选项等
  const PLANS = [
    {
      key: "basic",
      name: t("plans.basic.name"),
      price: SUBSCRIPTION_PLANS.basic,
      features: [
        t("plans.basic.features.0"),
        t("plans.basic.features.1"),
        t("plans.basic.features.2"),
        t("plans.basic.features.3"),
        t("plans.basic.features.4")
      ],
      highlight: false,
      tag: null,
      button: t("plans.basic.button", { defaultValue: "升级到基础版" }),
      comingSoon: false
    },
    {
      key: "ultimate",
      name: t("plans.ultimate.name", { defaultValue: "旗舰版" }),
      price: SUBSCRIPTION_PLANS.ultimate,
      features: [
        t("plans.ultimate.features.0"),
        t("plans.ultimate.features.1"),
        t("plans.ultimate.features.2"),
        t("plans.ultimate.features.3"),
        t("plans.ultimate.features.4"),
        t("plans.ultimate.features.5"),
        t("plans.ultimate.features.6"),
        t("plans.ultimate.features.7"),
        t("plans.ultimate.features.8")
      ],
      highlight: true,
      tag: t("plans.ultimate.tag", { defaultValue: "最受欢迎" }),
      button: t("plans.ultimate.button", { defaultValue: "升级到旗舰版" }),
      comingSoon: false
    },
    {
      key: "enterprise",
      name: t("plans.enterprise.name", { defaultValue: "企业版" }),
      price: SUBSCRIPTION_PLANS.enterprise,
      features: [
        t("plans.enterprise.features.0", { defaultValue: "自定义额度" }),
        t("plans.enterprise.features.1", { defaultValue: "专属支持" }),
        t("plans.enterprise.features.2", { defaultValue: "SLA与合规" }),
        t("plans.enterprise.features.3", { defaultValue: "团队管理" }),
        t("plans.enterprise.features.4", { defaultValue: "定制集成" }),
        t("plans.enterprise.features.5", { defaultValue: "大批量" })
      ],
      highlight: false,
      tag: null,
      button: t("plans.enterprise.button", { defaultValue: "即将推出" }),
      comingSoon: true
    }
  ]

  const handleSubscribe = (planKey: string) => {
    const plan = SUBSCRIPTION_PLANS[planKey as keyof typeof SUBSCRIPTION_PLANS];
    const price_id = plan[interval].price_id;
    
    if (!price_id) {
      console.error('订阅价格ID未配置，请检查环境变量和 config');
      return;
    }

    if (typeof window !== 'undefined' && window.Paddle) {
      const currentHost = window.location.host;
      const currentProtocol = window.location.protocol;
      const baseUrl = `${currentProtocol}//${currentHost}`;

      window.Paddle.Checkout.open({
        items: [{ priceId: price_id }],
        successUrl: `${baseUrl}/zh/subscribe?success=true`,
        cancelUrl: `${baseUrl}/zh/subscribe?canceled=true`,
        eventCallback: (data: any) => {
          console.log('Paddle event:', data);
          if (data.event === 'checkout.completed') {
            // 跳转到个人资料页
            window.location.href = 'http://localhost:3000/zh/profile';
          }
        }
      });
      } else {
      console.error('Paddle.js 未加载，无法弹出支付窗口');
      }
  };

  // 年付节省百分比
  const savePercent = 20

  return (
    <>
      <Script src="https://cdn.paddle.com/paddle/v2/paddle.js" strategy="beforeInteractive" />
      <div className="max-w-4xl mx-auto py-14 px-4">
        <h1 className="text-4xl font-bold text-center mb-2">选择您的套餐</h1>
        <div className="text-center text-lg text-muted-foreground mb-8">通过更快的生成和商业用途获得最佳体验</div>
        {/* 年付/月付切换器 */}
        <div className="flex justify-center items-center mb-10">
          <div className="flex bg-muted rounded-full p-1 relative">
        <button
              className={`px-6 py-2 rounded-full text-base font-semibold transition-colors duration-200 ${interval==='month' ? 'bg-primary text-white shadow' : 'text-foreground'}`}
          onClick={()=>setInterval('month')}
            >每月</button>
        <button
              className={`px-6 py-2 rounded-full text-base font-semibold transition-colors duration-200 ${interval==='year' ? 'bg-primary text-white shadow' : 'text-foreground'}`}
          onClick={()=>setInterval('year')}
            >每年 <span className="ml-1 text-xs bg-yellow-400 text-yellow-900 rounded px-2 py-0.5 align-middle">节省{savePercent}%</span></button>
          </div>
        </div>
        {/* 套餐卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, idx) => (
            <div
              key={plan.key}
              className={`relative flex flex-col border rounded-2xl p-8 bg-card shadow-xl transition-all duration-200 ${plan.highlight ? 'border-primary scale-105 z-10 shadow-2xl' : 'border-muted'} ${plan.comingSoon ? 'opacity-60' : ''}`}
              style={{ minHeight: 520 }}
            >
              {/* 标签 */}
              {plan.tag && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow">{plan.tag}</div>
              )}
              {/* 套餐名 */}
              <div className="text-xl font-bold text-center mb-2 mt-2">{plan.name}</div>
              {/* 价格 */}
              <div className="text-center mb-4">
                {plan.price && plan.price[interval] && plan.price[interval].price ? (
                  <span className="text-4xl font-extrabold">${plan.price[interval].price}</span>
                ) : (
                  <span className="text-4xl font-extrabold">自定义</span>
                )}
                <span className="text-base text-muted-foreground">/{interval==='year'?'年':'月'}</span>
      </div>
              {/* 功能点 */}
              <ul className="flex-1 mb-6 space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center text-base">
                    <span className="inline-block w-5 h-5 mr-2 text-green-500">✔</span>
                    <span>{f}</span>
                  </li>
                ))}
            </ul>
              {/* 按钮 */}
              <div className="mt-auto pt-4">
                {plan.comingSoon || (userPlan===plan.key && subscriptionStatus==='active') ? (
                  <button
                    className="w-full py-3 rounded-lg font-bold bg-black text-white border border-white shadow-lg cursor-not-allowed"
                    disabled
                    title={plan.comingSoon ? '即将推出' : '已是当前套餐，无法升级'}
                  >
                    {plan.button}
                  </button>
            ) : (
              <button
                    className={`w-full py-3 rounded-lg font-bold transition-colors duration-200 text-base bg-gray-200 text-gray-900 hover:bg-gray-300 ${loading===plan.key?'opacity-60':''}
                    `}
                disabled={!!loading}
                    onClick={() => handleSubscribe(plan.key)}
                  >
                    {loading===plan.key ? t('jumping') : plan.button}
                  </button>
            )}
              </div>
          </div>
        ))}
      </div>
      </div>
    </>
  )
} 
