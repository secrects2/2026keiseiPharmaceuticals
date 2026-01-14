'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Coins, TrendingUp, TrendingDown, Calendar, Gift, ShoppingBag } from 'lucide-react'

interface CoinBalance {
  government: number
  self: number
  total: number
  governmentValidUntil: string | null
}

interface Transaction {
  id: number
  amount: number
  coin_type: string
  transaction_type: string
  related_type: string
  transaction_date: string
  notes: string
}

export default function CoinsPage() {
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<CoinBalance>({
    government: 0,
    self: 0,
    total: 0,
    governmentValidUntil: null
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])

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

      // 取得運動幣餘額（區分政府幣和自有幣）
      const { data: coinData } = await supabase
        .from('sport_coins')
        .select('*')
        .eq('user_id', userData.id)

      let governmentCoins = 0
      let selfCoins = 0
      let validUntil = null

      coinData?.forEach((coin: any) => {
        if (coin.coin_type === 'government') {
          governmentCoins += parseFloat(coin.amount || 0)
          if (coin.valid_until) {
            validUntil = coin.valid_until
          }
        } else {
          selfCoins += parseFloat(coin.amount || 0)
        }
      })

      setBalance({
        government: governmentCoins,
        self: selfCoins,
        total: governmentCoins + selfCoins,
        governmentValidUntil: validUntil
      })

      // 取得交易記錄
      const { data: transactionsData } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', userData.id)
        .order('transaction_date', { ascending: false })
        .limit(20)

      setTransactions(transactionsData || [])
    } catch (error) {
      console.error('Error fetching coins data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'receive':
        return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'use':
        return <TrendingDown className="w-5 h-5 text-red-500" />
      case 'refund':
        return <Gift className="w-5 h-5 text-blue-500" />
      default:
        return <Coins className="w-5 h-5 text-gray-500" />
    }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'receive':
        return '獲得'
      case 'use':
        return '使用'
      case 'refund':
        return '退款'
      default:
        return '交易'
    }
  }

  const getCoinTypeLabel = (type: string) => {
    return type === 'government' ? '政府運動幣' : '自有運動幣'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">運動幣管理</h1>

        {/* 餘額卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 總餘額 */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">總餘額</h3>
              <Coins className="w-8 h-8" />
            </div>
            <p className="text-4xl font-bold">{balance.total}</p>
            <p className="text-sm opacity-90 mt-2">運動幣</p>
          </div>

          {/* 政府運動幣 */}
          <div className="bg-white rounded-lg p-6 border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">政府運動幣</h3>
              <Gift className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-4xl font-bold text-indigo-600">{balance.government}</p>
            {balance.governmentValidUntil && (
              <div className="flex items-center text-sm text-gray-600 mt-2">
                <Calendar className="w-4 h-4 mr-1" />
                <span>有效至 {new Date(balance.governmentValidUntil).toLocaleDateString('zh-TW')}</span>
              </div>
            )}
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
              <p className="text-xs text-gray-700">
                <strong>使用規則：</strong><br />
                • 做運動/看比賽：可全額 500 元抵用<br />
                • 添裝備：最高 200 元抵用
              </p>
            </div>
          </div>

          {/* 自有運動幣 */}
          <div className="bg-white rounded-lg p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">自有運動幣</h3>
              <ShoppingBag className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-4xl font-bold text-green-600">{balance.self}</p>
            <p className="text-sm text-gray-600 mt-2">無使用限制</p>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-700">
                <strong>獲得方式：</strong><br />
                • 參與活動<br />
                • 完成任務<br />
                • 平台贈送
              </p>
            </div>
          </div>
        </div>

        {/* 交易記錄 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">交易記錄</h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">尚無交易記錄</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {getTransactionLabel(transaction.transaction_type)} {transaction.amount} 運動幣
                      </p>
                      <p className="text-sm text-gray-600">
                        {getCoinTypeLabel(transaction.coin_type)}
                        {transaction.notes && ` • ${transaction.notes}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.transaction_date).toLocaleString('zh-TW')}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    transaction.transaction_type === 'receive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.transaction_type === 'receive' ? '+' : '-'}{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 如何獲得運動幣 */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">如何獲得運動幣？</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">政府運動幣抽籤</h4>
                <p className="text-sm text-gray-600">每年 1-2 月登記抽籤，中籤可獲得 500 元政府運動幣</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">參與平台活動</h4>
                <p className="text-sm text-gray-600">報名並完成運動活動，可獲得自有運動幣獎勵</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">完成任務</h4>
                <p className="text-sm text-gray-600">完成平台指定任務，獲得運動幣獎勵</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">推薦好友</h4>
                <p className="text-sm text-gray-600">邀請好友註冊並完成首次購買，雙方都可獲得獎勵</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
