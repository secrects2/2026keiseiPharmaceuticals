'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Coins, TrendingUp, TrendingDown, Gift, Search, Plus } from 'lucide-react'

interface CoinTransaction {
  id: number
  user_id: number
  transaction_type: string
  coin_type: string
  amount: number
  related_type: string
  transaction_date: string
  notes: string
  user: {
    name: string
    email: string
  }
}

export default function CoinsManagementPage() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<CoinTransaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [issueForm, setIssueForm] = useState({
    userEmail: '',
    coinType: 'government',
    amount: 500,
    notes: ''
  })

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('coin_transactions')
        .select(`
          *,
          user:users!coin_transactions_user_id_fkey(name, email)
        `)
        .order('transaction_date', { ascending: false })
        .limit(100)

      if (error) throw error

      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleIssueCoin = async () => {
    try {
      const supabase = createClient()

      // 查找用戶
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', issueForm.userEmail)
        .single()

      if (userError || !userData) {
        alert('找不到該用戶')
        return
      }

      // 發放運動幣
      const validUntil = issueForm.coinType === 'government' 
        ? new Date('2026-12-31').toISOString() 
        : null

      const { error: coinError } = await supabase
        .from('sport_coins')
        .insert({
          user_id: userData.id,
          amount: issueForm.amount,
          coin_type: issueForm.coinType,
          valid_until: validUntil,
          usage_category: issueForm.coinType === 'government' ? 'exercise' : null
        })

      if (coinError) throw coinError

      // 記錄交易
      const { error: txError } = await supabase
        .from('coin_transactions')
        .insert({
          user_id: userData.id,
          transaction_type: 'receive',
          coin_type: issueForm.coinType,
          amount: issueForm.amount,
          related_type: 'admin_issue',
          notes: issueForm.notes || '管理員發放'
        })

      if (txError) throw txError

      alert('運動幣發放成功！')
      setShowIssueModal(false)
      setIssueForm({
        userEmail: '',
        coinType: 'government',
        amount: 500,
        notes: ''
      })
      fetchTransactions()
    } catch (error: any) {
      alert(error.message || '發放失敗')
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || tx.coin_type === filterType
    return matchesSearch && matchesType
  })

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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">運動幣管理</h1>
          <button
            onClick={() => setShowIssueModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            發放運動幣
          </button>
        </div>

        {/* 搜尋和篩選 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 搜尋 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜尋用戶姓名或 Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* 類型篩選 */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">所有類型</option>
              <option value="government">政府運動幣</option>
              <option value="self">自有運動幣</option>
            </select>
          </div>
        </div>

        {/* 交易記錄 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">交易記錄</h2>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">找不到符合條件的交易記錄</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {getTransactionIcon(tx.transaction_type)}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {tx.user?.name || tx.user?.email} - {getTransactionLabel(tx.transaction_type)} {tx.amount} 運動幣
                      </p>
                      <p className="text-sm text-gray-600">
                        {getCoinTypeLabel(tx.coin_type)}
                        {tx.notes && ` • ${tx.notes}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(tx.transaction_date).toLocaleString('zh-TW')}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    tx.transaction_type === 'receive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.transaction_type === 'receive' ? '+' : '-'}{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 發放運動幣 Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">發放運動幣</h3>

            <div className="space-y-4">
              {/* 用戶 Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用戶 Email *
                </label>
                <input
                  type="email"
                  value={issueForm.userEmail}
                  onChange={(e) => setIssueForm({ ...issueForm, userEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="user@example.com"
                />
              </div>

              {/* 運動幣類型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  運動幣類型 *
                </label>
                <select
                  value={issueForm.coinType}
                  onChange={(e) => setIssueForm({ ...issueForm, coinType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="government">政府運動幣</option>
                  <option value="self">自有運動幣</option>
                </select>
              </div>

              {/* 金額 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  金額 *
                </label>
                <input
                  type="number"
                  value={issueForm.amount}
                  onChange={(e) => setIssueForm({ ...issueForm, amount: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="1"
                />
              </div>

              {/* 備註 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  備註
                </label>
                <textarea
                  value={issueForm.notes}
                  onChange={(e) => setIssueForm({ ...issueForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="發放原因..."
                />
              </div>
            </div>

            {/* 按鈕 */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowIssueModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleIssueCoin}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                確認發放
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
