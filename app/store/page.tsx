'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package, ShoppingCart, Calendar, TrendingUp, Users, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface StoreStats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  thisMonthRevenue: number
  totalEvents: number
  upcomingEvents: number
}

export default function StoreDashboard() {
  const [loading, setLoading] = useState(true)
  const [merchantId, setMerchantId] = useState<number | null>(null)
  const [merchantName, setMerchantName] = useState('')
  const [stats, setStats] = useState<StoreStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
    totalEvents: 0,
    upcomingEvents: 0
  })
  const router = useRouter()

  useEffect(() => {
    fetchStoreData()
  }, [])

  const fetchStoreData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // 取得店家資訊
      const { data: merchantData } = await supabase
        .from('partner_merchants')
        .select('*')
        .eq('contact_email', user.email)
        .single()

      if (!merchantData) {
        alert('找不到店家資料')
        return
      }

      setMerchantId(merchantData.id)
      setMerchantName(merchantData.merchant_name)

      // 取得商品統計
      const { data: productsData } = await supabase
        .from('sports_products')
        .select('*')

      const totalProducts = productsData?.length || 0
      const activeProducts = productsData?.filter(p => p.is_active).length || 0

      // 取得訂單統計
      const { data: ordersData } = await supabase
        .from('sports_sales')
        .select('*')
        .eq('merchant_id', merchantData.id)

      const totalOrders = ordersData?.length || 0
      const pendingOrders = ordersData?.filter(o => o.payment_status === 'pending').length || 0
      const totalRevenue = ordersData?.reduce((sum, o) => sum + parseFloat(o.total_amount.toString()), 0) || 0

      // 本月營收
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const thisMonthOrders = ordersData?.filter(o => new Date(o.sale_date) >= firstDayOfMonth) || []
      const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + parseFloat(o.total_amount.toString()), 0)

      // 取得活動統計
      const { data: eventsData } = await supabase
        .from('store_events')
        .select('*')
        .eq('merchant_id', merchantData.id)

      const totalEvents = eventsData?.length || 0
      const upcomingEvents = eventsData?.filter(e => new Date(e.start_time) > now).length || 0

      setStats({
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        totalRevenue,
        thisMonthRevenue,
        totalEvents,
        upcomingEvents
      })
    } catch (error) {
      console.error('載入店家資料失敗：', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('登出失敗：', error)
      alert('登出失敗，請稍後再試')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!merchantId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">找不到店家資料</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            返回登入
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">店家儀表板</h1>
            <p className="text-gray-600 mt-2">{merchantName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            登出
          </button>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 商品統計 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">商品數量</h3>
              <Package className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
            <p className="text-sm text-gray-600 mt-2">上架中：{stats.activeProducts} 個</p>
          </div>

          {/* 訂單統計 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">訂單數量</h3>
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
            <p className="text-sm text-gray-600 mt-2">待處理：{stats.pendingOrders} 筆</p>
          </div>

          {/* 營收統計 */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">總營收</h3>
              <TrendingUp className="w-8 h-8" />
            </div>
            <p className="text-3xl font-bold">NT$ {stats.totalRevenue.toLocaleString()}</p>
            <p className="text-sm mt-2">本月：NT$ {stats.thisMonthRevenue.toLocaleString()}</p>
          </div>

          {/* 活動統計 */}
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">活動數量</h3>
              <Calendar className="w-8 h-8" />
            </div>
            <p className="text-3xl font-bold">{stats.totalEvents}</p>
            <p className="text-sm mt-2">即將舉辦：{stats.upcomingEvents} 場</p>
          </div>
        </div>

        {/* 功能快捷入口 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/store/products"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">商品管理</h3>
                <p className="text-sm text-gray-600">管理商品、庫存、價格</p>
              </div>
            </div>
          </Link>

          <Link
            href="/store/orders"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">訂單管理</h3>
                <p className="text-sm text-gray-600">查看訂單、處理出貨</p>
              </div>
            </div>
          </Link>

          <Link
            href="/store/events"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">活動管理</h3>
                <p className="text-sm text-gray-600">建立活動、管理報名</p>
              </div>
            </div>
          </Link>

          <Link
            href="/store/schedules"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">課程表管理</h3>
                <p className="text-sm text-gray-600">管理店家課程時間表</p>
              </div>
            </div>
          </Link>

          <Link
            href="/store/checkin"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">活動報到</h3>
                <p className="text-sm text-gray-600">掃描 QR Code 報到</p>
              </div>
            </div>
          </Link>

          <Link
            href="/store/reports"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">銷售報表</h3>
                <p className="text-sm text-gray-600">查看營收統計、分析</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
