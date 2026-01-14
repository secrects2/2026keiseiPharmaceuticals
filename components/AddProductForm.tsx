'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AddProductFormProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddProductForm({ onClose, onSuccess }: AddProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    product_name: '',
    product_code: '',
    category: 'supplement',
    brand: '',
    specification: '',
    unit_price: '',
    cost_price: '',
    unit: '瓶',
    description: '',
    image_url: '',
    is_active: true,
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('sports_products')
        .insert([{
          ...formData,
          unit_price: Number(formData.unit_price),
          cost_price: Number(formData.cost_price),
        }])

      if (error) throw error

      alert('產品新增成功！')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to add product:', error)
      alert('新增失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">新增產品</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 產品名稱 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                產品名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="例如：乳清蛋白粉"
              />
            </div>

            {/* 產品編號 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                產品編號 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="product_code"
                value={formData.product_code}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="例如：PRD-001"
              />
            </div>

            {/* 分類 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分類 <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="supplement">營養補充品</option>
                <option value="equipment">運動器材</option>
                <option value="apparel">運動服飾</option>
              </select>
            </div>

            {/* 品牌 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                品牌
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="例如：Optimum Nutrition"
              />
            </div>

            {/* 規格 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                規格
              </label>
              <input
                type="text"
                name="specification"
                value={formData.specification}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="例如：1kg"
              />
            </div>

            {/* 單位 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                單位
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="例如：瓶、盒、組"
              />
            </div>

            {/* 單價 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                單價 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="例如：1200"
              />
            </div>

            {/* 成本價 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                成本價 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="例如：800"
              />
            </div>
          </div>

          {/* 圖片網址 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              圖片網址
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              產品描述
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="產品的詳細描述..."
            />
          </div>

          {/* 上架狀態 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              立即上架
            </label>
          </div>

          {/* 按鈕 */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '新增中...' : '新增產品'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
