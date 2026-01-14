'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package, Sparkles, Crown, Check, ArrowRight, Zap } from 'lucide-react'

interface SubscriptionPlan {
  id: number
  name: string
  description: string
  plan_type: 'basic' | 'advanced' | 'premium'
  monthly_price: number
  products_per_month: number
  course_quota: number
  sport_coins_per_month: number
  benefits: string[]
}

const planConfig = {
  basic: {
    icon: Package,
    color: 'from-blue-500 to-cyan-500',
    badge: '入門首選',
    highlight: false,
  },
  advanced: {
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    badge: '最受歡迎',
    highlight: true,
  },
  premium: {
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    badge: '尊榮體驗',
    highlight: false,
  },
}

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price', { ascending: true })

      if (error) throw error

      setPlans(data || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId: number) => {
    // TODO: 實作訂閱邏輯
    alert('訂閱功能開發中...')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* 標題區 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" />
            <span>訂閱制方案</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            選擇最適合您的運動方案
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            每月固定配送運動產品，搭配無限線上課程，讓運動成為生活的一部分
          </p>
        </div>

        {/* 方案卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const config = planConfig[plan.plan_type]
            const Icon = config.icon
            const isSelected = selectedPlan === plan.id

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl p-8 border-2 transition-all ${
                  config.highlight
                    ? 'border-indigo-500 shadow-2xl scale-105'
                    : isSelected
                    ? 'border-indigo-500 shadow-xl'
                    : 'border-gray-200 hover:border-indigo-300 hover:shadow-lg'
                }`}
              >
                {/* 推薦標籤 */}
                {config.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    {config.badge}
                  </div>
                )}

                {/* 圖標 */}
                <div className={`w-16 h-16 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center mb-6 mx-auto ${config.highlight ? 'mt-4' : ''}`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* 標題 */}
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600 text-center mb-6">{plan.description}</p>

                {/* 價格 */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-gray-600">NT$</span>
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.monthly_price.toLocaleString()}
                    </span>
                    <span className="text-gray-600">/月</span>
                  </div>
                </div>

                {/* 權益列表 */}
                <div className="space-y-3 mb-8">
                  {plan.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-5 h-5 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* 訂閱按鈕 */}
                <button
                  onClick={() => {
                    setSelectedPlan(plan.id)
                    handleSubscribe(plan.id)
                  }}
                  className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    config.highlight
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <span>立即訂閱</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )
          })}
        </div>

        {/* 常見問題 */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">常見問題</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📦 產品如何配送？</h3>
              <p className="text-sm text-gray-600">
                每月 1 號自動配送到您指定的地址，可隨時更改配送地址。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🎓 課程如何觀看？</h3>
              <p className="text-sm text-gray-600">
                訂閱後立即開通課程權限，可在會員中心無限次觀看。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">💰 運動幣如何使用？</h3>
              <p className="text-sm text-gray-600">
                每月自動發放到帳戶，可用於購買額外商品或課程。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔄 可以隨時取消嗎？</h3>
              <p className="text-sm text-gray-600">
                可以隨時取消，取消後當月仍可使用所有權益。
              </p>
            </div>
          </div>
        </div>

        {/* 優勢說明 */}
        <div className="mt-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">為什麼選擇訂閱制？</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">省錢划算</h3>
              <p className="text-sm text-gray-600">
                比單買產品和課程節省 30-50%，越用越划算
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">持續動力</h3>
              <p className="text-sm text-gray-600">
                每月新產品和課程，讓運動保持新鮮感和動力
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">專業指導</h3>
              <p className="text-sm text-gray-600">
                專業老師設計課程，確保運動效果和安全性
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
