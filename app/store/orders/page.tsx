'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingCart, ArrowLeft, Package, Truck } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: number
  sale_number: string
  product_name: string
  quantity: number
  total_amount: number
  sale_date: string
  payment_status: string
  delivery_status: string
}

export default function StoreOrdersPage() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // 取得店家資訊
      const { data: merchantData } = await supabase
        .from('partner_merchants')
        .select('id')
        .eq('contact_email', user.email)
        .single()

      if (!merchantData) return

      // 取得訂單
      const { data, error } = await supabase
        .from('sports_sales')
        .select('*')
        .eq('merchant_id', merchantData.id)
        .order('sale_date', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('載入訂單失敗：', error)
    } finally {
      setLoading(false)
    }
  }

  const updateDeliveryStatus = async (orderId: number, newStatus: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('sports_sales')
        .update({ 
          delivery_status: newStatus,
          delivery_date: newStatus === 'delivered' ? new Date().toISOString() : null
        })
        .eq('id', orderId)

      if (error) throw error
      fetchOrders()
      alert('配送狀態已更新')
    } catch (error) {
      console.error('更新配送狀態失敗：', error)
      alert('更新失敗')
    }
  }

  const getStatusBadge = (status: string, type: 'payment' | 'delivery') => {
    const styles = {
      payment: {
        pending: 'bg-yellow-100 text-yellow-800',
        paid: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800'
      },
      delivery: {
        pending: 'bg-gray-100 text-gray-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800'
      }
    }

    const labels = {
      payment: {
        pending: '待付款',
        paid: '已付款',
        failed: '付款失敗'
      },
      delivery: {
        pending: '待處理',
        processing: '處理中',
        shipped: '已出貨',
        delivered: '已送達'
      }
    }

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[type][status as keyof typeof styles.payment]}`}>
        {labels[type][status as keyof typeof labels.payment] || status}
      </span>
    )
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
        <div className="mb-8 flex items-center gap-4">
          <Link href="/store" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">訂單管理</h1>
            <p className="text-gray-600 mt-2">查看和處理訂單</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">尚無訂單</h3>
            <p className="text-gray-600">當有顧客下單後，訂單會顯示在這裡</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">訂單 #{order.sale_number}</h3>
                      {getStatusBadge(order.payment_status, 'payment')}
                      {getStatusBadge(order.delivery_status, 'delivery')}
                    </div>
                    <p className="text-sm text-gray-600">
                      下單時間：{new Date(order.sale_date).toLocaleString('zh-TW')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">
                      NT$ {order.total_amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{order.product_name}</p>
                      <p className="text-sm text-gray-600">數量：{order.quantity}</p>
                    </div>

                    {order.payment_status === 'paid' && order.delivery_status !== 'delivered' && (
                      <div className="flex items-center gap-2">
                        {order.delivery_status === 'pending' && (
                          <button
                            onClick={() => updateDeliveryStatus(order.id, 'processing')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Package className="w-4 h-4" />
                            開始處理
                          </button>
                        )}
                        {order.delivery_status === 'processing' && (
                          <button
                            onClick={() => updateDeliveryStatus(order.id, 'shipped')}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          >
                            <Truck className="w-4 h-4" />
                            標記為已出貨
                          </button>
                        )}
                        {order.delivery_status === 'shipped' && (
                          <button
                            onClick={() => updateDeliveryStatus(order.id, 'delivered')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            完成配送
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
