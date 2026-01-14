'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SkeletonStats, SkeletonList } from '@/components/SkeletonCard'

interface DashboardData {
  coinBalance: number
  recentEvents: any[]
  recentRedemptions: any[]
  stats: {
    totalEvents: number
    totalRedemptions: number
    totalPurchases: number
  }
}

export default function MemberDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // 取得 user_id
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!userData) return

      // 取得運動幣餘額
      const { data: coinData } = await supabase
        .from('sport_coins')
        .select('amount')
        .eq('user_id', userData.id)
        .single()

      // 取得近期活動
      const { data: eventsData } = await supabase
        .from('event_registrations')
        .select('*, event:events(*)')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // 取得近期兌換
      const { data: redemptionsData } = await supabase
        .from('redemptions')
        .select('*, product:sports_products(*)')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // 統計資料
      const { count: eventsCount } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.id)

      const { count: redemptionsCount } = await supabase
        .from('redemptions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.id)

      const { count: purchasesCount } = await supabase
        .from('sports_sales')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.id)

      setData({
        coinBalance: coinData?.amount || 0,
        recentEvents: eventsData || [],
        recentRedemptions: redemptionsData || [],
        stats: {
          totalEvents: eventsCount || 0,
          totalRedemptions: redemptionsCount || 0,
          totalPurchases: purchasesCount || 0,
        },
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">會員儀表板</h1>
          <p className="mt-1 text-sm text-gray-600">歡迎回來！</p>
        </div>
        <SkeletonStats />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonList />
          <SkeletonList />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">無法載入資料</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">會員儀表板</h1>
        <p className="mt-1 text-sm text-gray-600">歡迎回來！</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">🪙</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">運動幣餘額</p>
              <p className="text-2xl font-semibold text-gray-900">{data.coinBalance}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">參與活動</p>
              <p className="text-2xl font-semibold text-gray-900">{data.stats.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">兌換次數</p>
              <p className="text-2xl font-semibold text-gray-900">{data.stats.totalRedemptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">🛒</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">購買次數</p>
              <p className="text-2xl font-semibold text-gray-900">{data.stats.totalPurchases}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 近期活動 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">近期活動</h2>
        </div>
        <div className="p-6">
          {data.recentEvents.length > 0 ? (
            <div className="space-y-4">
              {data.recentEvents.map((registration: any) => (
                <div key={registration.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{registration.event?.name || '未知活動'}</p>
                    <p className="text-sm text-gray-500">
                      {registration.event?.event_date ? new Date(registration.event.event_date).toLocaleDateString('zh-TW') : ''}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    registration.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {registration.status === 'confirmed' ? '已確認' :
                     registration.status === 'pending' ? '待確認' : '已取消'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">尚無活動記錄</p>
          )}
        </div>
      </div>

      {/* 近期兌換 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">近期兌換</h2>
        </div>
        <div className="p-6">
          {data.recentRedemptions.length > 0 ? (
            <div className="space-y-4">
              {data.recentRedemptions.map((redemption: any) => (
                <div key={redemption.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{redemption.product?.name || '未知商品'}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(redemption.created_at).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-indigo-600">-{redemption.coins_spent} 🪙</p>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      redemption.status === 'completed' ? 'bg-green-100 text-green-800' :
                      redemption.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {redemption.status === 'completed' ? '已完成' :
                       redemption.status === 'processing' ? '處理中' : '待處理'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">尚無兌換記錄</p>
          )}
        </div>
      </div>
    </div>
  )
}
