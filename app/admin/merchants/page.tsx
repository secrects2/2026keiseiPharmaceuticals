'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import MerchantFormModal from '@/components/MerchantFormModal'

interface Merchant {
  id: number
  merchant_code: string
  merchant_name: string
  business_type: string | null
  contact_person: string | null
  contact_phone: string | null
  contact_email: string | null
  address: string | null
  commission_rate: number
  partnership_status: string
  contract_start_date: string | null
  contract_end_date: string | null
  notes: string | null
  partnership_start_date: string | null
  status: string
}

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null)

  const supabase = createClient()

  const fetchMerchants = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('partner_merchants')
        .select('*')
        .order('id', { ascending: false })

      if (error) throw error
      setMerchants(data || [])
    } catch (error) {
      console.error('Failed to fetch merchants:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMerchants()
  }, [])

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = 
      merchant.merchant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.merchant_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (merchant.contact_person && merchant.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))

    const status = merchant.partnership_status || merchant.status
    const matchesStatus = !statusFilter || status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此合作夥伴嗎？')) return

    try {
      const { error } = await supabase
        .from('partner_merchants')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('合作夥伴刪除成功！')
      fetchMerchants()
    } catch (error) {
      console.error('Failed to delete merchant:', error)
      alert('刪除失敗，請稍後再試')
    }
  }

  const handleEdit = (merchant: Merchant) => {
    setEditingMerchant(merchant)
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingMerchant(null)
    setShowModal(true)
  }

  const activeCount = filteredMerchants.filter(m => (m.partnership_status || m.status) === 'active').length
  const negotiatingCount = filteredMerchants.filter(m => (m.partnership_status || m.status) === 'negotiating' || (m.partnership_status || m.status) === 'pending').length
  const avgCommission = filteredMerchants.length > 0
    ? (filteredMerchants.reduce((sum, m) => sum + Number(m.commission_rate), 0) / filteredMerchants.length).toFixed(1)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">載入中...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">合作夥伴</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>新增合作夥伴</span>
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總合作夥伴</p>
              <p className="text-2xl font-bold text-gray-900">{filteredMerchants.length}</p>
            </div>
            <div className="text-3xl">🤝</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">合作中</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">洽談中</p>
              <p className="text-2xl font-bold text-yellow-600">{negotiatingCount}</p>
            </div>
            <div className="text-3xl">💬</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均佣金率</p>
              <p className="text-2xl font-bold text-indigo-600">{avgCommission}%</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
      </div>

      {/* 合作夥伴列表 */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="搜尋商家名稱、編號或聯絡人..."
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
              <option value="active">合作中</option>
              <option value="negotiating">洽談中</option>
              <option value="pending">洽談中</option>
              <option value="terminated">已終止</option>
              <option value="inactive">已終止</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">商家</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">編號</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">業務類型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">聯絡人</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">聯絡電話</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">佣金率</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMerchants.map((merchant) => {
                const status = merchant.partnership_status || merchant.status
                return (
                  <tr key={merchant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{merchant.merchant_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{merchant.merchant_code}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{merchant.business_type || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{merchant.contact_person || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{merchant.contact_phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{Number(merchant.commission_rate).toFixed(1)}%</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        status === 'active' ? 'bg-green-100 text-green-800' :
                        (status === 'negotiating' || status === 'pending') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status === 'active' && '合作中'}
                        {(status === 'negotiating' || status === 'pending') && '洽談中'}
                        {(status === 'terminated' || status === 'inactive') && '已終止'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(merchant)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => handleDelete(merchant.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredMerchants.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              沒有找到符合條件的合作夥伴
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <MerchantFormModal
          merchant={editingMerchant}
          onClose={() => {
            setShowModal(false)
            setEditingMerchant(null)
          }}
          onSuccess={fetchMerchants}
        />
      )}
    </div>
  )
}
