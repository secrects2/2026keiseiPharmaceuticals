'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, DollarSign, ShoppingCart, Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ReportData {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  topProducts: Array<{
    product_name: string
    total_quantity: number
    total_revenue: number
  }>
  monthlyRevenue: Array<{
    month: string
    revenue: number
  }>
}

export default function StoreReportsPage() {
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    monthlyRevenue: []
  })

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data: merchantData } = await supabase
        .from('partner_merchants')
        .select('id')
        .eq('contact_email', user.email)
        .single()

      if (!merchantData) return

      // 取得所有訂單
      const { data: orders } = await supabase
        .from('sports_sales')
        .select('*')
        .eq('merchant_id', merchantData.id)
        .eq('payment_status', 'paid')

      if (!orders) return

      // 計算總營收和訂單數
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0)
      const totalOrders = orders.length
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // 計算熱銷商品
      const productMap = new Map<string, { quantity: number, revenue: number }>()
      orders.forEach(order => {
        const existing = productMap.get(order.product_name) || { quantity: 0, revenue: 0 }
        productMap.set(order.product_name, {
          quantity: existing.quantity + order.quantity,
          revenue: existing.revenue + parseFloat(order.total_amount.toString())
        })
      })

      const topProducts = Array.from(productMap.entries())
        .map(([name, data]) => ({
          product_name: name,
          total_quantity: data.quantity,
          total_revenue: data.revenue
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 5)

      // 計算月度營收
      const monthMap = new Map<string, number>()
      orders.forEach(order => {
        const month = new Date(order.sale_date).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })
        monthMap.set(month, (monthMap.get(month) || 0) + parseFloat(order.total_amount.toString()))
      })

      const monthlyRevenue = Array.from(monthMap.entries())
        .map(([month, revenue]) => ({ month, revenue }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6) // 最近 6 個月

      setReportData({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        topProducts,
        monthlyRevenue
      })
    } catch (error) {
      console.error('載入報表資料失敗：', error)
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/store" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">銷售報表</h1>
            <p className="text-gray-600 mt-2">查看營收統計和分析</p>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">總營收</h3>
              <DollarSign className="w-8 h-8" />
            </div>
            <p className="text-3xl font-bold">NT$ {reportData.totalRevenue.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">總訂單數</h3>
              <ShoppingCart className="w-8 h-8" />
            </div>
            <p className="text-3xl font-bold">{reportData.totalOrders}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">平均訂單金額</h3>
              <TrendingUp className="w-8 h-8" />
            </div>
            <p className="text-3xl font-bold">NT$ {Math.round(reportData.averageOrderValue).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 熱銷商品 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">熱銷商品 Top 5</h2>
            </div>
            {reportData.topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">尚無銷售資料</p>
            ) : (
              <div className="space-y-4">
                {reportData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.product_name}</p>
                        <p className="text-sm text-gray-600">銷售 {product.total_quantity} 件</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">
                        NT$ {product.total_revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 月度營收 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">月度營收趨勢</h2>
            </div>
            {reportData.monthlyRevenue.length === 0 ? (
              <p className="text-gray-500 text-center py-8">尚無銷售資料</p>
            ) : (
              <div className="space-y-3">
                {reportData.monthlyRevenue.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-900">{item.month}</span>
                    <span className="font-bold text-green-600">
                      NT$ {item.revenue.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
