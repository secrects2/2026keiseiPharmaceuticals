'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProductCharts from '@/components/ProductCharts'
import ProductFormModal from '@/components/ProductFormModal'

interface Product {
  id: number
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const supabase = createClient()

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sports_products')
        .select('*')
        .order('id', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = !categoryFilter || product.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此產品嗎？')) return

    try {
      const { error } = await supabase
        .from('sports_products')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('產品刪除成功！')
      fetchProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
      alert('刪除失敗，請稍後再試')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingProduct(null)
  }

  const handleSuccess = () => {
    fetchProducts()
  }

  const totalValue = filteredProducts.reduce((sum, p) => sum + Number(p.unit_price), 0)
  const activeCount = filteredProducts.filter(p => p.is_active).length
  const inactiveCount = filteredProducts.filter(p => !p.is_active).length

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
        <h1 className="text-2xl font-bold text-gray-900">產品管理</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>新增產品</span>
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總產品數</p>
              <p className="text-2xl font-bold text-gray-900">{filteredProducts.length}</p>
            </div>
            <div className="text-3xl">📦</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">上架中</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">已下架</p>
              <p className="text-2xl font-bold text-gray-600">{inactiveCount}</p>
            </div>
            <div className="text-3xl">❌</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總價值</p>
              <p className="text-2xl font-bold text-indigo-600">NT$ {totalValue.toLocaleString()}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
      </div>

      {/* 動態圖表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">數據分析</h2>
          <p className="text-sm text-gray-600">
            {searchTerm || categoryFilter ? '顯示篩選後的數據' : '顯示全部數據'}
          </p>
        </div>
        <ProductCharts products={filteredProducts} />
      </div>

      {/* 產品列表 */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">產品列表</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="搜尋產品名稱、編號或品牌..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">所有分類</option>
              <option value="supplement">營養補充品</option>
              <option value="equipment">運動器材</option>
              <option value="apparel">運動服飾</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">產品</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">編號</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分類</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">品牌</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">單價</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成本價</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {product.image_url && (
                        <img src={product.image_url} alt={product.product_name} className="w-10 h-10 rounded mr-3 object-cover" />
                      )}
                      <span className="font-medium text-gray-900">{product.product_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.product_code}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.category === 'supplement' && '營養補充品'}
                    {product.category === 'equipment' && '運動器材'}
                    {product.category === 'apparel' && '運動服飾'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.brand || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">NT$ {Number(product.unit_price).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">NT$ {Number(product.cost_price).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_active ? '上架中' : '已下架'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              沒有找到符合條件的產品
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProductFormModal
          product={editingProduct}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
