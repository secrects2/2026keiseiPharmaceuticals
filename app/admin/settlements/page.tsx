'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Download, Calendar, TrendingUp, Coins } from 'lucide-react'

interface DailyReport {
  date: string
  totalTransactions: number
  governmentCoinUsed: number
  selfCoinUsed: number
  totalRevenue: number
  courseRevenue: number
  productRevenue: number
}

interface WeeklyReport {
  weekStart: string
  weekEnd: string
  totalTransactions: number
  governmentCoinUsed: number
  selfCoinUsed: number
  totalRevenue: number
  teacherPayouts: number
}

export default function SettlementsPage() {
  const [loading, setLoading] = useState(true)
  const [viewType, setViewType] = useState<'daily' | 'weekly'>('daily')
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    fetchReports()
  }, [selectedMonth])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // 取得選定月份的交易記錄
      const monthStart = new Date(selectedMonth + '-01')
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)

      const { data: transactions } = await supabase
        .from('coin_transactions')
        .select('*')
        .gte('transaction_date', monthStart.toISOString())
        .lte('transaction_date', monthEnd.toISOString())
        .eq('transaction_type', 'use')

      // 生成日報表
      const dailyMap = new Map<string, DailyReport>()
      
      transactions?.forEach(tx => {
        const date = new Date(tx.transaction_date).toLocaleDateString('zh-TW')
        const existing = dailyMap.get(date) || {
          date,
          totalTransactions: 0,
          governmentCoinUsed: 0,
          selfCoinUsed: 0,
          totalRevenue: 0,
          courseRevenue: 0,
          productRevenue: 0
        }

        existing.totalTransactions++
        if (tx.coin_type === 'government') {
          existing.governmentCoinUsed += tx.amount
        } else {
          existing.selfCoinUsed += tx.amount
        }
        existing.totalRevenue += tx.amount

        if (tx.related_type === 'course') {
          existing.courseRevenue += tx.amount
        } else if (tx.related_type === 'product') {
          existing.productRevenue += tx.amount
        }

        dailyMap.set(date, existing)
      })

      const daily = Array.from(dailyMap.values()).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      setDailyReports(daily)

      // 生成週報表
      const weeklyMap = new Map<string, WeeklyReport>()

      transactions?.forEach(tx => {
        const date = new Date(tx.transaction_date)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)

        const weekKey = weekStart.toISOString().split('T')[0]
        const existing = weeklyMap.get(weekKey) || {
          weekStart: weekStart.toLocaleDateString('zh-TW'),
          weekEnd: weekEnd.toLocaleDateString('zh-TW'),
          totalTransactions: 0,
          governmentCoinUsed: 0,
          selfCoinUsed: 0,
          totalRevenue: 0,
          teacherPayouts: 0
        }

        existing.totalTransactions++
        if (tx.coin_type === 'government') {
          existing.governmentCoinUsed += tx.amount
        } else {
          existing.selfCoinUsed += tx.amount
        }
        existing.totalRevenue += tx.amount

        // 計算老師分潤（70%）
        if (tx.related_type === 'course') {
          existing.teacherPayouts += tx.amount * 0.7
        }

        weeklyMap.set(weekKey, existing)
      })

      const weekly = Array.from(weeklyMap.values()).sort((a, b) => 
        new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
      )

      setWeeklyReports(weekly)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportDailyReport = () => {
    const csv = [
      ['日期', '交易筆數', '政府運動幣使用', '自有運動幣使用', '總營收', '課程營收', '商品營收'],
      ...dailyReports.map(r => [
        r.date,
        r.totalTransactions,
        r.governmentCoinUsed,
        r.selfCoinUsed,
        r.totalRevenue,
        r.courseRevenue,
        r.productRevenue
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `daily_report_${selectedMonth}.csv`
    link.click()
  }

  const exportWeeklyReport = () => {
    const csv = [
      ['週起始日', '週結束日', '交易筆數', '政府運動幣使用', '自有運動幣使用', '總營收', '老師分潤'],
      ...weeklyReports.map(r => [
        r.weekStart,
        r.weekEnd,
        r.totalTransactions,
        r.governmentCoinUsed,
        r.selfCoinUsed,
        r.totalRevenue,
        r.teacherPayouts.toFixed(0)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `weekly_report_${selectedMonth}.csv`
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
          <h1 className="text-3xl font-bold text-gray-900">核銷管理</h1>
          <button
            onClick={viewType === 'daily' ? exportDailyReport : exportWeeklyReport}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Download className="w-5 h-5 mr-2" />
            匯出報表
          </button>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">本月交易筆數</h3>
              <FileText className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {dailyReports.reduce((sum, r) => sum + r.totalTransactions, 0)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">政府運動幣使用</h3>
              <Coins className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {dailyReports.reduce((sum, r) => sum + r.governmentCoinUsed, 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">自有運動幣使用</h3>
              <Coins className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {dailyReports.reduce((sum, r) => sum + r.selfCoinUsed, 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">本月總營收</h3>
              <TrendingUp className="w-8 h-8" />
            </div>
            <p className="text-3xl font-bold">
              NT$ {dailyReports.reduce((sum, r) => sum + r.totalRevenue, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* 月份選擇和報表類型切換 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 月份選擇 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                選擇月份
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* 報表類型切換 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">報表類型</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewType('daily')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    viewType === 'daily'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  日報表
                </button>
                <button
                  onClick={() => setViewType('weekly')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    viewType === 'weekly'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  週報表
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 報表內容 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {viewType === 'daily' ? '日報表' : '週報表'}
          </h2>

          {viewType === 'daily' ? (
            dailyReports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">本月尚無交易記錄</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">日期</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">交易筆數</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">政府運動幣</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">自有運動幣</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">總營收</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">課程營收</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">商品營收</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyReports.map((report, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">{report.date}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{report.totalTransactions}</td>
                        <td className="py-3 px-4 text-right text-green-600">{report.governmentCoinUsed}</td>
                        <td className="py-3 px-4 text-right text-purple-600">{report.selfCoinUsed}</td>
                        <td className="py-3 px-4 text-right font-semibold text-indigo-600">
                          NT$ {report.totalRevenue.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          NT$ {report.courseRevenue.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          NT$ {report.productRevenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            weeklyReports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">本月尚無交易記錄</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">週期</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">交易筆數</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">政府運動幣</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">自有運動幣</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">總營收</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">老師分潤</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyReports.map((report, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">
                          {report.weekStart} ~ {report.weekEnd}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">{report.totalTransactions}</td>
                        <td className="py-3 px-4 text-right text-green-600">{report.governmentCoinUsed}</td>
                        <td className="py-3 px-4 text-right text-purple-600">{report.selfCoinUsed}</td>
                        <td className="py-3 px-4 text-right font-semibold text-indigo-600">
                          NT$ {report.totalRevenue.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-orange-600">
                          NT$ {report.teacherPayouts.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
