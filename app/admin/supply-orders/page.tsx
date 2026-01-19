'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingCart, Eye, CheckCircle, Clock, Package } from 'lucide-react'
import Link from 'next/link'

interface SupplyOrder {
  id: number
  merchant_id: number
  order_number: string
  order_date: string
  total_amount: number
  status: string
  payment_status: string
  delivery_date: string | null
  notes: string | null
  merchant?: {
    merchant_name: string
    merchant_code: string
  }
}

export default function SupplyOrdersManagement() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<SupplyOrder[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('merchant_supply_orders')
        .select(`
          *,
          merchant:partner_merchants!merchant_supply_orders_merchant_id_fkey(merchant_name, merchant_code)
        `)
        .order('order_date', { ascending: false })

      if (error) throw error
      setOrders(data || [])

    } catch (error) {
      console.error('Error fetching supply orders:', error)
      alert('載入進貨訂單失敗')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('merchant_supply_orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      alert('訂單狀態已更新！')
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('更新失敗')
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesStatus = !statusFilter || order.status === statusFilter
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.merchant?.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    
    const labels: Record<string, string> = {
      pending: '待處理',
      processing: '處理中',
      shipped: '已出貨',
      completed: '已完成',
      cancelled: '已取消'
    }

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getPaymentBadge = (status: string) => {
    return status === 'paid' ? (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        已付款
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
        未付款
      </span>
    )
  }

  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const totalAmount = orders.reduce((sum, o) => sum + o.total_amount, 0)
  const completedOrders = orders.filter(o => o.status === 'completed').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 頁面標題 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">進貨訂單管理</h1>
            <p className="text-gray-500 mt-1">管理店家的進貨訂單</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            返回儀表板
          </Link>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">總訂單數</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待處理</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingOrders}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已完成</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{completedOrders}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">總金額</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  NT$ {(totalAmount / 1000).toFixed(0)}K
                </p>
              </div>
              <Package className="w-12 h-12 text-purple-600" />
            </div>
          </div>
        </div>

        {/* 搜尋與篩選 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="搜尋訂單編號或店家名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">所有狀態</option>
              <option value="pending">待處理</option>
              <option value="processing">處理中</option>
              <option value="shipped">已出貨</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
        </div>

        {/* 訂單列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  訂單編號
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  店家資訊
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  訂單日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  付款狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  訂單狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>尚無進貨訂單</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{order.order_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900 font-medium">{order.merchant?.merchant_name || '未知店家'}</p>
                        <p className="text-gray-500">{order.merchant?.merchant_code || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(order.order_date).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        NT$ {order.total_amount.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentBadge(order.payment_status)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/supply-orders/${order.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="查看詳情"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'processing')}
                            className="text-blue-600 hover:text-blue-900"
                            title="開始處理"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                            className="text-purple-600 hover:text-purple-900"
                            title="標記為已出貨"
                          >
                            <Package className="w-5 h-5" />
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="text-green-600 hover:text-green-900"
                            title="完成訂單"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
