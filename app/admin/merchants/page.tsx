'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Merchant {
  id: number
  merchant_name: string
  merchant_code: string
  contact_person: string | null
  contact_phone: string | null
  contact_email: string | null
  address: string | null
  business_type: string | null
  partnership_start_date: string | null
  status: string
  commission_rate: number
  notes: string | null
  created_at: string
  updated_at: string
}

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchMerchants()
  }, [])

  useEffect(() => {
    filterMerchants()
  }, [merchants, searchTerm, statusFilter])

  const fetchMerchants = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('partner_merchants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch merchants:', error)
    } else {
      setMerchants(data || [])
    }
    setLoading(false)
  }

  const filterMerchants = () => {
    let filtered = merchants

    // 搜尋篩選
    if (searchTerm) {
      filtered = filtered.filter(merchant =>
        merchant.merchant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        merchant.merchant_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (merchant.contact_person && merchant.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // 狀態篩選
    if (statusFilter) {
      filtered = filtered.filter(merchant => merchant.status === statusFilter)
    }

    setFilteredMerchants(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: '合作中', className: 'bg-green-100 text-green-800' },
      pending: { label: '洽談中', className: 'bg-yellow-100 text-yellow-800' },
      inactive: { label: '已終止', className: 'bg-gray-100 text-gray-800' },
    }
    return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
  }

  const stats = {
    total: merchants.length,
    active: merchants.filter(m => m.status === 'active').length,
    pending: merchants.filter(m => m.status === 'pending').length,
    avgCommission: merchants.length > 0
      ? merchants.reduce((sum, m) => sum + (Number(m.commission_rate) || 0), 0) / merchants.length
      : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">合作夥伴</h1>
          <p className="text-gray-600 mt-1">管理合作商家與合作關係</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          + 新增合作夥伴
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總合作夥伴</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="text-3xl">🤝</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">合作中</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">洽談中</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="text-3xl">💬</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均佣金率</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {stats.avgCommission.toFixed(1)}%
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
      </div>

      {/* 合作夥伴列表 */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">合作夥伴列表</h2>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="搜尋商家..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">全部狀態</option>
                <option value="active">合作中</option>
                <option value="pending">洽談中</option>
                <option value="inactive">已終止</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商家資訊
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  業務類型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  聯絡人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  聯絡方式
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  佣金率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  合作開始
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMerchants.length > 0 ? (
                filteredMerchants.map((merchant) => {
                  const statusBadge = getStatusBadge(merchant.status)
                  return (
                    <tr key={merchant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{merchant.merchant_name}</p>
                          <p className="text-xs text-gray-500">{merchant.merchant_code}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{merchant.business_type || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{merchant.contact_person || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{merchant.contact_phone || '-'}</p>
                          <p className="text-gray-500">{merchant.contact_email || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                        {Number(merchant.commission_rate).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {merchant.partnership_start_date 
                          ? new Date(merchant.partnership_start_date).toLocaleDateString('zh-TW')
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                            編輯
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                            詳情
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <p className="text-4xl mb-2">🤝</p>
                      <p className="text-sm">
                        {searchTerm || statusFilter ? '找不到符合條件的合作夥伴' : '尚無合作夥伴資料'}
                      </p>
                      {!searchTerm && !statusFilter && (
                        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                          新增第一個合作夥伴
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
