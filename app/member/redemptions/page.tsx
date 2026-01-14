'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RedemptionsPage() {
  const [loading, setLoading] = useState(true)
  const [redemptions, setRedemptions] = useState<any[]>([])

  useEffect(() => {
    fetchRedemptions()
  }, [])

  const fetchRedemptions = async () => {
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

      // 取得兌換記錄
      const { data: redemptionsData } = await supabase
        .from('redemptions')
        .select('*, product:sports_products(*)')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })

      setRedemptions(redemptionsData || [])
    } catch (error) {
      console.error('Failed to fetch redemptions:', error)
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

  // 統計資料
  const totalRedemptions = redemptions.length
  const totalCoinsSpent = redemptions.reduce((sum, r) => sum + r.coins_spent, 0)
  const completedRedemptions = redemptions.filter(r => r.status === 'completed').length
  const processingRedemptions = redemptions.filter(r => r.status === 'processing').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">兌換記錄</h1>
        <p className="mt-1 text-sm text-gray-600">查看您的商品兌換記錄</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">總兌換次數</p>
              <p className="text-2xl font-semibold text-gray-900">{totalRedemptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">🪙</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">總花費運動幣</p>
              <p className="text-2xl font-semibold text-gray-900">{totalCoinsSpent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">已完成</p>
              <p className="text-2xl font-semibold text-gray-900">{completedRedemptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">處理中</p>
              <p className="text-2xl font-semibold text-gray-900">{processingRedemptions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 兌換記錄列表 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">兌換明細</h2>
        </div>
        <div className="overflow-x-auto">
          {redemptions.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    花費運動幣
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    兌換時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {redemptions.map((redemption) => (
                  <tr key={redemption.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {redemption.product?.image_url && (
                          <img
                            src={redemption.product.image_url}
                            alt={redemption.product.name}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {redemption.product?.name || '未知商品'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {redemption.product?.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-semibold text-indigo-600">
                        <span className="mr-1">{redemption.coins_spent}</span>
                        <span>🪙</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(redemption.created_at).toLocaleString('zh-TW')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        redemption.status === 'completed' ? 'bg-green-100 text-green-800' :
                        redemption.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {redemption.status === 'completed' ? '已完成' :
                         redemption.status === 'processing' ? '處理中' : '待處理'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500">尚無兌換記錄</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
