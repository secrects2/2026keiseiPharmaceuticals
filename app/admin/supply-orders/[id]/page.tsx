'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Package, Calendar, DollarSign, User } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface SupplyOrder {
  id: number
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
    contact_person: string
    contact_phone: string
    address: string
  }
}

export default function SupplyOrderDetail() {
  const params = useParams()
  const orderId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<SupplyOrder | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])

  useEffect(() => {
    fetchOrderDetail()
  }, [orderId])

  const fetchOrderDetail = async () => {
    try {
      const supabase = createClient()
      
      // 獲取訂單資訊
      const { data: orderData, error: orderError } = await supabase
        .from('merchant_supply_orders')
        .select(`
          *,
          merchant:partner_merchants!merchant_supply_orders_merchant_id_fkey(
            merchant_name,
            merchant_code,
            contact_person,
            contact_phone,
            address
          )
        `)
        .eq('id', orderId)
        .single()

      if (orderError) throw orderError
      setOrder(orderData)

      // 獲取訂單明細
      const { data: itemsData, error: itemsError } = await supabase
        .from('merchant_supply_order_items')
        .select('*')
        .eq('order_id', orderId)

      if (itemsError) throw itemsError
      setItems(itemsData || [])

    } catch (error) {
      console.error('Error fetching order detail:', error)
      alert('載入訂單詳情失敗')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500">找不到訂單</p>
        <Link href="/admin/supply-orders" className="mt-4 text-indigo-600 hover:text-indigo-900">
          返回訂單列表
        </Link>
      </div>
    )
  }

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
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/supply-orders"
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">訂單詳情</h1>
              <p className="text-gray-500 mt-1">{order.order_number}</p>
            </div>
          </div>
          {getStatusBadge(order.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：訂單資訊 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 訂單明細 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">訂單明細</h2>
              <div className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暫無商品</p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500">
                          NT$ {item.unit_price.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900">
                        NT$ {item.subtotal.toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              {/* 總計 */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">總計</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    NT$ {order.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* 備註 */}
            {order.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">備註</h2>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>

          {/* 右側：店家資訊 */}
          <div className="space-y-6">
            {/* 店家資訊 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                店家資訊
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">店家名稱</p>
                  <p className="font-medium text-gray-900">{order.merchant?.merchant_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">店家代碼</p>
                  <p className="font-medium text-gray-900">{order.merchant?.merchant_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">聯絡人</p>
                  <p className="font-medium text-gray-900">{order.merchant?.contact_person}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">聯絡電話</p>
                  <p className="font-medium text-gray-900">{order.merchant?.contact_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">地址</p>
                  <p className="font-medium text-gray-900">{order.merchant?.address}</p>
                </div>
              </div>
            </div>

            {/* 訂單資訊 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                訂單資訊
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">訂單日期</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.order_date).toLocaleDateString('zh-TW')}
                  </p>
                </div>
                {order.delivery_date && (
                  <div>
                    <p className="text-sm text-gray-500">預計送達日期</p>
                    <p className="font-medium text-gray-900">
                      {new Date(order.delivery_date).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">付款狀態</p>
                  <p className="font-medium text-gray-900">
                    {order.payment_status === 'paid' ? (
                      <span className="text-green-600">✓ 已付款</span>
                    ) : (
                      <span className="text-gray-600">○ 未付款</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
