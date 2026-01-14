'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id?: number
  product_name: string
  product_code: string
  category: string | null
  brand: string | null
  specification: string | null
  unit_price: number
  cost_price: number
  unit: string | null
  description: string | null
  image_url: string | null
  is_active: boolean
}

interface ProductFormModalProps {
  product?: Product | null
  onClose: () => void
  onSuccess: () => void
}

export default function ProductFormModal({ product, onClose, onSuccess }: ProductFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Product>({
    product_name: '',
    product_code: '',
    category: 'supplement',
    brand: '',
    specification: '',
    unit_price: 0,
    cost_price: 0,
    unit: '瓶',
    description: '',
    image_url: '',
    is_active: true,
  })

  const supabase = createClient()
  const isEdit = !!product

  useEffect(() => {
    if (product) {
      setFormData(product)
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit && product?.id) {
        // 更新
        const { error } = await supabase
          .from('sports_products')
          .update({
            product_name: formData.product_name,
            product_code: formData.product_code,
            category: formData.category,
            brand: formData.brand,
            specification: formData.specification,
            unit_price: Number(formData.unit_price),
            cost_price: Number(formData.cost_price),
            unit: formData.unit,
            description: formData.description,
            image_url: formData.image_url,
            is_active: formData.is_active,
          })
          .eq('id', product.id)

        if (error) throw error
        alert('產品更新成功！')
      } else {
        // 新增
        const { error } = await supabase
          .from('sports_products')
          .insert([{
            product_name: formData.product_name,
            product_code: formData.product_code,
            category: formData.category,
            brand: formData.brand,
            specification: formData.specification,
            unit_price: Number(formData.unit_price),
            cost_price: Number(formData.cost_price),
            unit: formData.unit,
            description: formData.description,
            image_url: formData.image_url,
            is_active: formData.is_active,
          }])

        if (error) throw error
        alert('產品新增成功！')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to save product:', error)
      alert(isEdit ? '更新失敗，請稍後再試' : '新增失敗，請稍後再試')
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
            <h2 className="text-xl font-bold text-gray-900">
              {isEdit ? '編輯產品' : '新增產品'}
            </h2>
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
              />
            </div>

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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分類 <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category || 'supplement'}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="supplement">營養補充品</option>
                <option value="equipment">運動器材</option>
                <option value="apparel">運動服飾</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">品牌</label>
              <input
                type="text"
                name="brand"
                value={formData.brand || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">規格</label>
              <input
                type="text"
                name="specification"
                value={formData.specification || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">單位</label>
              <input
                type="text"
                name="unit"
                value={formData.unit || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

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
              />
            </div>

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
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">圖片網址</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">產品描述</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="ml-2 text-sm text-gray-700">上架</label>
          </div>

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
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? (isEdit ? '更新中...' : '新增中...') : (isEdit ? '更新產品' : '新增產品')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
