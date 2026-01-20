'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DollarSign, TrendingUp, Users, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react'

interface RevenueSharing {
  id: number
  entity_type: string
  entity_id: number
  entity_name: string
  revenue_amount: number
  sharing_percentage: number
  sharing_amount: number
  period_start: string
  period_end: string
  settlement_status: string
  settlement_date: string | null
  notes: string | null
  created_at: string
}

export default function RevenueSharingPage() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<RevenueSharing[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('revenue_sharing')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('Error fetching revenue sharing records:', error)
      alert('載入分潤記錄失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const supabase = createClient()
      const updateData: any = { settlement_status: status }
      
      if (status === 'settled') {
        updateData.settlement_date = new Date().toISOString().split('T')[0]
      }

      const { error } = await supabase
        .from('revenue_sharing')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      alert('更新結算狀態成功')
      fetchRecords()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('更新結算狀態失敗')
    }
  }

  const filteredRecords = records.filter(record => {
    if (filterStatus !== 'all' && record.settlement_status !== filterStatus) return false
    if (filterType !== 'all' && record.entity_type !== filterType) return false
    return true
  })

  const totalPending = records.filter(r => r.settlement_status === 'pending').reduce((sum, r) => sum + r.sharing_amount, 0)
  const totalSettled = records.filter(r => r.settlement_status === 'settled').reduce((sum, r) => sum + r.sharing_amount, 0)
  const totalRecords = records.length
  const pendingCount = records.filter(r => r.settlement_status === 'pending').length

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">分潤管理</h1>
          <p className="text-gray-500 mt-1">管理老師和店家的收益分潤</p>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">總分潤記錄</p>
                <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
              </div>
              <Users className="w-10 h-10 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待結算金額</p>
                <p className="text-2xl font-bold text-yellow-600">
                  NT$ {totalPending.toLocaleString()}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已結算金額</p>
                <p className="text-2xl font-bold text-green-600">
                  NT$ {totalSettled.toLocaleString()}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待處理筆數</p>
                <p className="text-2xl font-bold text-indigo-600">{pendingCount}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-indigo-400" />
            </div>
          </div>
        </div>

        {/* 篩選器 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">結算狀態</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">全部</option>
                <option value="pending">待結算</option>
                <option value="processing">處理中</option>
                <option value="settled">已結算</option>
                <option value="failed">結算失敗</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分潤對象</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">全部</option>
                <option value="teacher">授課老師</option>
                <option value="merchant">合作店家</option>
              </select>
            </div>
          </div>
        </div>

        {/* 分潤記錄列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">對象類型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">對象名稱</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">營收金額</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分潤比例</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分潤金額</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">結算期間</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    暫無分潤記錄
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.entity_type === 'teacher' && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          授課老師
                        </span>
                      )}
                      {record.entity_type === 'merchant' && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          合作店家
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.entity_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      NT$ {record.revenue_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.sharing_percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                      NT$ {record.sharing_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.period_start).toLocaleDateString('zh-TW')}
                      {' ~ '}
                      {new Date(record.period_end).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.settlement_status === 'pending' && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          待結算
                        </span>
                      )}
                      {record.settlement_status === 'processing' && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          處理中
                        </span>
                      )}
                      {record.settlement_status === 'settled' && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          已結算
                        </span>
                      )}
                      {record.settlement_status === 'failed' && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          結算失敗
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {record.settlement_status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(record.id, 'processing')}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          開始處理
                        </button>
                      )}
                      {record.settlement_status === 'processing' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(record.id, 'settled')}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            標記已結算
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(record.id, 'failed')}
                            className="text-red-600 hover:text-red-900"
                          >
                            標記失敗
                          </button>
                        </>
                      )}
                      {record.settlement_status === 'failed' && (
                        <button
                          onClick={() => handleUpdateStatus(record.id, 'pending')}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          重新處理
                        </button>
                      )}
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
