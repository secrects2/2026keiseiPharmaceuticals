'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CoinsPage() {
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    fetchCoinsData()
  }, [])

  const fetchCoinsData = async () => {
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

      setBalance(coinData?.amount || 0)

      // 取得交易記錄（兌換記錄）
      const { data: redemptionsData } = await supabase
        .from('redemptions')
        .select('*, product:sports_products(name)')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })

      // 取得活動報名記錄（可能獲得運動幣）
      const { data: eventsData } = await supabase
        .from('event_registrations')
        .select('*, event:events(name)')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })

      // 合併交易記錄
      const allTransactions = [
        ...(redemptionsData || []).map(r => ({
          id: `redemption-${r.id}`,
          type: 'spend',
          amount: -r.coins_spent,
          description: `兌換商品：${r.product?.name || '未知商品'}`,
          date: r.created_at,
        })),
        ...(eventsData || []).map(e => ({
          id: `event-${e.id}`,
          type: 'earn',
          amount: 50, // 假設每次活動獲得 50 運動幣
          description: `參與活動：${e.event?.name || '未知活動'}`,
          date: e.created_at,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setTransactions(allTransactions)
    } catch (error) {
      console.error('Failed to fetch coins data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">載入中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">運動幣管理</h1>
        <p className="mt-1 text-sm text-gray-600">查看您的運動幣餘額和交易記錄</p>
      </div>

      {/* 餘額卡片 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">目前餘額</p>
            <p className="text-5xl font-bold mt-2">{balance}</p>
            <p className="text-sm opacity-90 mt-1">運動幣</p>
          </div>
          <div className="text-6xl">🪙</div>
        </div>
      </div>

      {/* 獲得運動幣的方式 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">如何獲得運動幣？</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="font-medium text-gray-900">參與活動</p>
              <p className="text-sm text-gray-600">每次參與活動可獲得運動幣</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-medium text-gray-900">完成任務</p>
              <p className="text-sm text-gray-600">完成指定任務獲得獎勵</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="font-medium text-gray-900">特殊活動</p>
              <p className="text-sm text-gray-600">參與特殊活動獲得額外獎勵</p>
            </div>
          </div>
        </div>
      </div>

      {/* 交易記錄 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">交易記錄</h2>
        </div>
        <div className="p-6">
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'earn' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <span className="text-xl">
                        {transaction.type === 'earn' ? '📥' : '📤'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleString('zh-TW')}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${
                    transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">尚無交易記錄</p>
          )}
        </div>
      </div>
    </div>
  )
}
