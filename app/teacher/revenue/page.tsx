'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react'

interface RevenueDetail {
  id: number
  enrollment_date: string
  payment_amount: string
  teacher_revenue: number
  user: {
    name: string
  }
  course: {
    course_name: string
  }
}

interface MonthlyRevenue {
  month: string
  total: number
  count: number
}

export default function TeacherRevenuePage() {
  const [loading, setLoading] = useState(true)
  const [revenueDetails, setRevenueDetails] = useState<RevenueDetail[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalWithdrawn, setTotalWithdrawn] = useState(0)
  const [pendingPayout, setPendingPayout] = useState(0)

  useEffect(() => {
    fetchRevenue()
  }, [])

  const fetchRevenue = async () => {
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

      // 取得老師資訊
      const { data: teacherData } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', userData.id)
        .single()

      if (!teacherData) return

      // 取得收益明細
      const { data: enrollmentsData } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          user:users!course_enrollments_user_id_fkey(name),
          course:courses!course_enrollments_course_id_fkey(course_name, teacher_id)
        `)
        .eq('course.teacher_id', teacherData.id)
        .order('enrollment_date', { ascending: false })

      const details = (enrollmentsData || []).map(e => ({
        ...e,
        teacher_revenue: parseFloat(e.payment_amount) * 0.7
      }))

      setRevenueDetails(details)

      // 計算總營收
      const total = details.reduce((sum, d) => sum + d.teacher_revenue, 0)
      setTotalRevenue(total)

      // 簡化版：假設尚未提領
      setTotalWithdrawn(0)
      setPendingPayout(total)

      // 計算每月營收
      const monthlyMap = new Map<string, {total: number, count: number}>()
      details.forEach(d => {
        const month = new Date(d.enrollment_date).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit' })
        const existing = monthlyMap.get(month) || { total: 0, count: 0 }
        monthlyMap.set(month, {
          total: existing.total + d.teacher_revenue,
          count: existing.count + 1
        })
      })

      const monthly = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => b.month.localeCompare(a.month))

      setMonthlyRevenue(monthly)
    } catch (error) {
      console.error('Error fetching revenue:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = () => {
    alert('提領功能開發中，請聯繫平台管理員')
  }

  const handleExport = () => {
    // 簡化版：生成 CSV
    const csv = [
      ['日期', '學員', '課程', '付款金額', '您的收益（70%）'],
      ...revenueDetails.map(d => [
        new Date(d.enrollment_date).toLocaleDateString('zh-TW'),
        d.user?.name,
        d.course?.course_name,
        d.payment_amount,
        d.teacher_revenue.toFixed(0)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `revenue_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
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
          <h1 className="text-3xl font-bold text-gray-900">收益查詢</h1>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Download className="w-5 h-5 mr-2" />
            匯出明細
          </button>
        </div>

        {/* 收益統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 總營收 */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">總營收</h3>
              <DollarSign className="w-8 h-8" />
            </div>
            <p className="text-3xl font-bold">NT$ {totalRevenue.toLocaleString()}</p>
            <p className="text-sm opacity-90 mt-2">70% 分潤</p>
          </div>

          {/* 已提領 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">已提領</h3>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">NT$ {totalWithdrawn.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-2">已入帳金額</p>
          </div>

          {/* 待提領 */}
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">待提領</h3>
              <DollarSign className="w-8 h-8" />
            </div>
            <p className="text-3xl font-bold">NT$ {pendingPayout.toLocaleString()}</p>
            <button
              onClick={handleWithdraw}
              className="mt-4 w-full px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              申請提領
            </button>
          </div>
        </div>

        {/* 每月營收趨勢 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-2" />
            每月營收趨勢
          </h2>

          {monthlyRevenue.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">尚無營收記錄</p>
            </div>
          ) : (
            <div className="space-y-4">
              {monthlyRevenue.map((item) => (
                <div
                  key={item.month}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{item.month}</p>
                    <p className="text-sm text-gray-600">{item.count} 筆報名</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">
                      NT$ {item.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 收益明細 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">收益明細</h2>

          {revenueDetails.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">尚無收益記錄</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">日期</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">學員</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">課程</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">付款金額</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">您的收益（70%）</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueDetails.map((detail) => (
                    <tr key={detail.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">
                        {new Date(detail.enrollment_date).toLocaleDateString('zh-TW')}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{detail.user?.name}</td>
                      <td className="py-3 px-4 text-gray-700">{detail.course?.course_name}</td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        NT$ {detail.payment_amount}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-indigo-600">
                        NT$ {detail.teacher_revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
