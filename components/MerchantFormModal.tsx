'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Merchant {
  id?: number
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
}

interface MerchantFormModalProps {
  merchant?: Merchant | null
  onClose: () => void
  onSuccess: () => void
}

export default function MerchantFormModal({ merchant, onClose, onSuccess }: MerchantFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Merchant>({
    merchant_code: '',
    merchant_name: '',
    business_type: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    address: '',
    commission_rate: 0,
    partnership_status: 'active',
    contract_start_date: '',
    contract_end_date: '',
    notes: '',
  })

  const supabase = createClient()
  const isEdit = !!merchant

  useEffect(() => {
    if (merchant) {
      setFormData(merchant)
    }
  }, [merchant])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit && merchant?.id) {
        const { error } = await supabase
          .from('partner_merchants')
          .update({
            merchant_code: formData.merchant_code,
            merchant_name: formData.merchant_name,
            business_type: formData.business_type,
            contact_person: formData.contact_person,
            contact_phone: formData.contact_phone,
            contact_email: formData.contact_email,
            address: formData.address,
            commission_rate: Number(formData.commission_rate),
            partnership_status: formData.partnership_status,
            contract_start_date: formData.contract_start_date || null,
            contract_end_date: formData.contract_end_date || null,
            notes: formData.notes,
          })
          .eq('id', merchant.id)

        if (error) throw error
        alert('合作夥伴更新成功！')
      } else {
        const { error } = await supabase
          .from('partner_merchants')
          .insert([{
            merchant_code: formData.merchant_code,
            merchant_name: formData.merchant_name,
            business_type: formData.business_type,
            contact_person: formData.contact_person,
            contact_phone: formData.contact_phone,
            contact_email: formData.contact_email,
            address: formData.address,
            commission_rate: Number(formData.commission_rate),
            partnership_status: formData.partnership_status,
            contract_start_date: formData.contract_start_date || null,
            contract_end_date: formData.contract_end_date || null,
            notes: formData.notes,
          }])

        if (error) throw error
        alert('合作夥伴新增成功！')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to save merchant:', error)
      alert(isEdit ? '更新失敗，請稍後再試' : '新增失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {isEdit ? '編輯合作夥伴' : '新增合作夥伴'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商家編號 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="merchant_code"
                value={formData.merchant_code}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商家名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="merchant_name"
                value={formData.merchant_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">業務類型</label>
              <input
                type="text"
                name="business_type"
                value={formData.business_type || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">聯絡人</label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">聯絡電話</label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">聯絡信箱</label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                佣金率 (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="commission_rate"
                value={formData.commission_rate}
                onChange={handleChange}
                required
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                合作狀態 <span className="text-red-500">*</span>
              </label>
              <select
                name="partnership_status"
                value={formData.partnership_status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">合作中</option>
                <option value="negotiating">洽談中</option>
                <option value="terminated">已終止</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">合約開始日期</label>
              <input
                type="date"
                name="contract_start_date"
                value={formData.contract_start_date || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">合約結束日期</label>
              <input
                type="date"
                name="contract_end_date"
                value={formData.contract_end_date || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
            <input
              type="text"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (isEdit ? '更新中...' : '新增中...') : (isEdit ? '更新' : '新增')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
