'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PurchasesPage() {
  const [loading, setLoading] = useState(true)
  const [purchases, setPurchases] = useState<any[]>([])

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
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

      // 取得購買記錄
      const { data: purchasesData } = await supabase
        .from('member_purchases')
        .select('*, product:sports_products(*)')
        .eq('user_id', userData.id)
        .order('purchase_date', { ascending: false })

      setPurchases(purchasesData || [])
    } catch (error) {
      console.error('Failed to fetch purchases:', error)
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
  const totalPurchases = purchases.length
  const totalAmount = purchases.reduce((sum, p) => sum + (p.amount || 0), 0)
  const completedPurchases = purchases.filter(p => p.status === 'completed').length
  const pendingPurchases = purchases.filter(p => p.status === 'pending').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">購買記錄</h1>
        <p className="mt-1 text-sm text-gray-600">查看您的商品購買記錄</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">🛒</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">總購買次數</p>
              <p className="text-2xl font-semibold text-gray-900">{totalPurchases}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">總消費金額</p>
              <p className="text-2xl font-semibold text-gray-900">NT$ {totalAmount.toLocaleString()}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{completedPurchases}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{pendingPurchases}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 購買記錄列表 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">購買明細</h2>
        </div>
        <div className="overflow-x-auto">
          {purchases.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    數量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    購買時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {purchase.product?.image_url && (
                          <img
                            src={purchase.product.image_url}
                            alt={purchase.product.name}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {purchase.product?.name || '未知商品'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {purchase.product?.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.quantity || 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        NT$ {(purchase.amount || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(purchase.purchase_date).toLocaleString('zh-TW')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        purchase.status === 'completed' ? 'bg-green-100 text-green-800' :
                        purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        purchase.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {purchase.status === 'completed' ? '已完成' :
                         purchase.status === 'pending' ? '處理中' :
                         purchase.status === 'cancelled' ? '已取消' : '待處理'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500">尚無購買記錄</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
