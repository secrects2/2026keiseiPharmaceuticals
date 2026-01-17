'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Store, Users, GraduationCap, Package, 
  TrendingUp, DollarSign, Calendar, Activity,
  ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalMerchants: number
  activeMerchants: number
  totalTeachers: number
  totalMembers: number
  totalRevenue: number
  monthlyRevenue: number
  totalCourses: number
  totalProducts: number
  pendingFees: number
  pendingRevenue: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalMerchants: 0,
    activeMerchants: 0,
    totalTeachers: 0,
    totalMembers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalCourses: 0,
    totalProducts: 0,
    pendingFees: 0,
    pendingRevenue: 0
  })

  useEffect(() => {
    checkAuth()
    fetchStats()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      router.push('/login')
      return
    }

    setUser(user)
  }

  const fetchStats = async () => {
    try {
      const supabase = createClient()

      const { count: merchantCount } = await supabase
        .from('partner_merchants')
        .select('*', { count: 'exact', head: true })

      const { count: activeMerchantCount } = await supabase
        .from('partner_merchants')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      const { count: teacherCount } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true })

      const { count: memberCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user')

      const { count: courseCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })

      const { count: productCount } = await supabase
        .from('sports_products')
        .select('*', { count: 'exact', head: true })

      const { data: salesData } = await supabase
        .from('sports_sales')
        .select('total_amount, created_at')

      const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0
      
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthlyRevenue = salesData?.filter(sale => {
        const saleDate = new Date(sale.created_at)
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
      }).reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0

      const { data: pendingFeesData } = await supabase
        .from('merchant_fees')
        .select('annual_fee')
        .eq('payment_status', 'pending')

      const pendingFees = pendingFeesData?.reduce((sum, fee) => sum + (fee.annual_fee || 0), 0) || 0

      const { data: pendingRevenueData } = await supabase
        .from('revenue_sharing')
        .select('entity_share')
        .eq('status', 'pending')

      const pendingRevenue = pendingRevenueData?.reduce((sum, rev) => sum + (rev.entity_share || 0), 0) || 0

      setStats({
        totalMerchants: merchantCount || 0,
        activeMerchants: activeMerchantCount || 0,
        totalTeachers: teacherCount || 0,
        totalMembers: memberCount || 0,
        totalRevenue,
        monthlyRevenue,
        totalCourses: courseCount || 0,
        totalProducts: productCount || 0,
        pendingFees,
        pendingRevenue
      })

    } catch (error) {
      console.error('載入統計資料失敗：', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">惠生醫藥集團數位中台</h1>
            <p className="text-sm text-gray-600 mt-1">集團管理員</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            登出
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Store className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                {stats.activeMerchants}/{stats.totalMerchants}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">合作店家</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMerchants}</p>
            <p className="text-xs text-gray-500 mt-1">活躍店家：{stats.activeMerchants}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">{stats.totalCourses} 門課程</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">授課老師</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTeachers}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                12%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">平台會員</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMembers}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">本月</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">總營收</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              NT$ {stats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              本月：NT$ {stats.monthlyRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" />
              待處理事項
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">待收年費</p>
                  <p className="text-sm text-gray-600 mt-1">尚未繳納的店家年費</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">
                    NT$ {stats.pendingFees.toLocaleString()}
                  </p>
                  <Link 
                    href="/admin/merchants"
                    className="text-sm text-red-600 hover:text-red-700 mt-1 inline-block"
                  >
                    查看詳情 →
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">待結算分潤</p>
                  <p className="text-sm text-gray-600 mt-1">老師和店家待結算金額</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">
                    NT$ {stats.pendingRevenue.toLocaleString()}
                  </p>
                  <Link 
                    href="/admin/revenue-sharing"
                    className="text-sm text-orange-600 hover:text-orange-700 mt-1 inline-block"
                  >
                    查看詳情 →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              快速統計
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <span className="text-gray-600">課程總數</span>
                <span className="font-bold text-gray-900">{stats.totalCourses} 門</span>
              </div>
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <span className="text-gray-600">商品總數</span>
                <span className="font-bold text-gray-900">{stats.totalProducts} 件</span>
              </div>
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <span className="text-gray-600">活躍店家比例</span>
                <span className="font-bold text-gray-900">
                  {stats.totalMerchants > 0 
                    ? Math.round((stats.activeMerchants / stats.totalMerchants) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-gray-600">平均每店家營收</span>
                <span className="font-bold text-gray-900">
                  NT$ {stats.activeMerchants > 0 
                    ? Math.round(stats.totalRevenue / stats.activeMerchants).toLocaleString() 
                    : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">管理功能</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/merchants"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <Store className="w-8 h-8 text-gray-600 group-hover:text-indigo-600 mb-3" />
              <span className="text-sm font-medium text-gray-900">合作店家</span>
            </Link>

            <Link
              href="/admin/teachers"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <GraduationCap className="w-8 h-8 text-gray-600 group-hover:text-indigo-600 mb-3" />
              <span className="text-sm font-medium text-gray-900">授課老師</span>
            </Link>

            <Link
              href="/admin/supply-products"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <Package className="w-8 h-8 text-gray-600 group-hover:text-indigo-600 mb-3" />
              <span className="text-sm font-medium text-gray-900">供應產品</span>
            </Link>

            <Link
              href="/admin/supply-orders"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <Calendar className="w-8 h-8 text-gray-600 group-hover:text-indigo-600 mb-3" />
              <span className="text-sm font-medium text-gray-900">進貨訂單</span>
            </Link>

            <Link
              href="/admin/revenue-sharing"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <DollarSign className="w-8 h-8 text-gray-600 group-hover:text-indigo-600 mb-3" />
              <span className="text-sm font-medium text-gray-900">分潤管理</span>
            </Link>

            <Link
              href="/admin/members"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <Users className="w-8 h-8 text-gray-600 group-hover:text-indigo-600 mb-3" />
              <span className="text-sm font-medium text-gray-900">會員管理</span>
            </Link>

            <Link
              href="/admin/analytics"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <TrendingUp className="w-8 h-8 text-gray-600 group-hover:text-indigo-600 mb-3" />
              <span className="text-sm font-medium text-gray-900">數據分析</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <Package className="w-8 h-8 text-gray-600 group-hover:text-indigo-600 mb-3" />
              <span className="text-sm font-medium text-gray-900">產品管理</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
