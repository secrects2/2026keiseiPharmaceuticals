'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, DollarSign, Calendar, CheckCircle, XCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface MerchantFee {
  id: number
  fee_year: number
  fee_amount: number
  payment_status: string
  payment_date: string | null
  contract_start_date: string
  contract_end_date: string
  notes: string | null
  created_at: string
}

interface Merchant {
  id: number
  merchant_name: string
  merchant_code: string
  annual_fee: number
}

export default function MerchantFees() {
  const params = useParams()
  const merchantId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [fees, setFees] = useState<MerchantFee[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newFee, setNewFee] = useState({
    fee_year: new Date().getFullYear(),
    fee_amount: 0,
    contract_start_date: '',
    contract_end_date: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [merchantId])

  const fetchData = async () => {
    try {
      const supabase = createClient()
      
      // 獲取店家資訊
      const { data: merchantData, error: merchantError } = await supabase
        .from('partner_merchants')
        .select('id, merchant_name, merchant_code, annual_fee')
        .eq('id', merchantId)
        .single()

      if (merchantError) throw merchantError
      setMerchant(merchantData)
      
      // 設定預設年費金額
      setNewFee(prev => ({ ...prev, fee_amount: merchantData.annual_fee || 0 }))

      // 獲取年費記錄
      const { data: feesData, error: feesError } = await supabase
        .from('merchant_fees')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('fee_year', { ascending: false })

      if (feesError) throw feesError
      setFees(feesData || [])

    } catch (error) {
      console.error('Error fetching data:', error)
      alert('載入資料失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleAddFee = async () => {
    if (!newFee.contract_start_date || !newFee.contract_end_date) {
      alert('請填寫合約起訖日期')
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('merchant_fees')
        .insert({
          merchant_id: parseInt(merchantId),
          fee_year: newFee.fee_year,
          fee_amount: newFee.fee_amount,
          payment_status: 'pending',
          contract_start_date: newFee.contract_start_date,
          contract_end_date: newFee.contract_end_date,
          notes: newFee.notes || null
        })

      if (error) throw error

      alert('新增年費記錄成功')
      setShowAddModal(false)
      setNewFee({
        fee_year: new Date().getFullYear(),
        fee_amount: merchant?.annual_fee || 0,
        contract_start_date: '',
        contract_end_date: '',
        notes: ''
      })
      fetchData()
    } catch (error) {
      console.error('Error adding fee:', error)
      alert('新增年費記錄失敗')
    }
  }

  const handleUpdatePaymentStatus = async (feeId: number, status: string) => {
    try {
      const supabase = createClient()
      const updateData: any = { payment_status: status }
      
      if (status === 'paid') {
        updateData.payment_date = new Date().toISOString().split('T')[0]
      }

      const { error } = await supabase
        .from('merchant_fees')
        .update(updateData)
        .eq('id', feeId)

      if (error) throw error

      alert('更新付款狀態成功')
      fetchData()
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('更新付款狀態失敗')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!merchant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500">找不到店家</p>
        <Link href="/admin/merchants" className="mt-4 text-indigo-600 hover:text-indigo-900">
          返回店家列表
        </Link>
      </div>
    )
  }

  const totalPaid = fees.filter(f => f.payment_status === 'paid').length
  const totalPending = fees.filter(f => f.payment_status === 'pending').length
  const totalOverdue = fees.filter(f => f.payment_status === 'overdue').length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/merchants"
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">年費管理</h1>
              <p className="text-gray-500 mt-1">
                {merchant.merchant_name} ({merchant.merchant_code})
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            新增年費記錄
          </button>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">總記錄數</p>
                <p className="text-2xl font-bold text-gray-900">{fees.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已繳納</p>
                <p className="text-2xl font-bold text-green-600">{totalPaid}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待繳納</p>
                <p className="text-2xl font-bold text-yellow-600">{totalPending}</p>
              </div>
              <DollarSign className="w-10 h-10 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已逾期</p>
                <p className="text-2xl font-bold text-red-600">{totalOverdue}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
          </div>
        </div>

        {/* 年費記錄列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">年度</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">年費金額</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">合約期間</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">付款狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">付款日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    暫無年費記錄
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {fee.fee_year} 年
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      NT$ {fee.fee_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(fee.contract_start_date).toLocaleDateString('zh-TW')}
                      {' ~ '}
                      {new Date(fee.contract_end_date).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {fee.payment_status === 'paid' && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          已繳納
                        </span>
                      )}
                      {fee.payment_status === 'pending' && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          待繳納
                        </span>
                      )}
                      {fee.payment_status === 'overdue' && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          已逾期
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fee.payment_date ? new Date(fee.payment_date).toLocaleDateString('zh-TW') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {fee.payment_status !== 'paid' && (
                        <button
                          onClick={() => handleUpdatePaymentStatus(fee.id, 'paid')}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          標記已繳納
                        </button>
                      )}
                      {fee.payment_status === 'pending' && (
                        <button
                          onClick={() => handleUpdatePaymentStatus(fee.id, 'overdue')}
                          className="text-red-600 hover:text-red-900"
                        >
                          標記逾期
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

      {/* 新增年費記錄 Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">新增年費記錄</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年度</label>
                <input
                  type="number"
                  value={newFee.fee_year}
                  onChange={(e) => setNewFee({ ...newFee, fee_year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年費金額</label>
                <input
                  type="number"
                  value={newFee.fee_amount}
                  onChange={(e) => setNewFee({ ...newFee, fee_amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">合約開始日期</label>
                <input
                  type="date"
                  value={newFee.contract_start_date}
                  onChange={(e) => setNewFee({ ...newFee, contract_start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">合約結束日期</label>
                <input
                  type="date"
                  value={newFee.contract_end_date}
                  onChange={(e) => setNewFee({ ...newFee, contract_end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                <textarea
                  value={newFee.notes}
                  onChange={(e) => setNewFee({ ...newFee, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAddFee}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                新增
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
