'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'

export default function NewSupplyProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    product_code: '',
    product_name: '',
    category: '',
    specification: '',
    unit: '',
    supply_price: '',
    retail_price: '',
    stock_quantity: '',
    min_order_quantity: '',
    description: '',
    image_url: '',
    is_available: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('supply_products')
        .insert([{
          product_code: formData.product_code,
          product_name: formData.product_name,
          category: formData.category,
          specification: formData.specification || null,
          unit: formData.unit,
          supply_price: parseFloat(formData.supply_price),
          retail_price: parseFloat(formData.retail_price),
          stock_quantity: parseInt(formData.stock_quantity),
          min_order_quantity: parseInt(formData.min_order_quantity),
          description: formData.description || null,
          image_url: formData.image_url || null,
          is_available: formData.is_available
        }])

      if (error) throw error

      alert('供應產品新增成功！')
      router.push('/admin/supply-products')
    } catch (error) {
      console.error('Error creating supply product:', error)
      alert('新增失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 頁面標題 */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/admin/supply-products"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">新增供應產品</h1>
            <p className="text-gray-500 mt-1">填寫產品資訊</p>
          </div>
        </div>

        {/* 表單 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* 基本資訊 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本資訊</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  產品編號 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.product_code}
                  onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="例：SP001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  產品名稱 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="例：運動護膝"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  產品分類 *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">請選擇分類</option>
                  <option value="運動護具">運動護具</option>
                  <option value="健身器材">健身器材</option>
                  <option value="運動服飾">運動服飾</option>
                  <option value="營養補給">營養補給</option>
                  <option value="復健用品">復健用品</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  規格
                </label>
                <input
                  type="text"
                  value={formData.specification}
                  onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="例：M號、500ml"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  單位 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="例：個、盒、瓶"
                />
              </div>
            </div>
          </div>

          {/* 價格與庫存 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">價格與庫存</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  供應價格 (NT$) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.supply_price}
                  onChange={(e) => setFormData({ ...formData, supply_price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="提供給店家的價格"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  建議售價 (NT$) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.retail_price}
                  onChange={(e) => setFormData({ ...formData, retail_price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="建議店家的售價"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  庫存數量 *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="目前庫存"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最小訂購量 *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.min_order_quantity}
                  onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="店家最少需訂購數量"
                />
              </div>
            </div>
          </div>

          {/* 產品描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              產品描述
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="產品的詳細說明..."
            />
          </div>

          {/* 產品圖片 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              產品圖片 URL
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="https://example.com/image.jpg"
            />
            {formData.image_url && (
              <img
                src={formData.image_url}
                alt="預覽"
                className="mt-2 w-32 h-32 object-cover rounded"
              />
            )}
          </div>

          {/* 供應狀態 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="is_available" className="ml-2 text-sm text-gray-700">
              立即開放供應
            </label>
          </div>

          {/* 按鈕 */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {loading ? '新增中...' : '新增產品'}
            </button>
            <Link
              href="/admin/supply-products"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center"
            >
              取消
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
