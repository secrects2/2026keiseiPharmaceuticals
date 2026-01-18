'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package, Plus, Edit, Trash2, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface SupplyProduct {
  id: number
  product_code: string
  product_name: string
  category: string
  specification: string | null
  unit: string
  supply_price: number
  retail_price: number
  stock_quantity: number
  min_order_quantity: number
  description: string | null
  image_url: string | null
  is_available: boolean
  created_at: string
}

export default function SupplyProductsManagement() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<SupplyProduct[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('supply_products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])

    } catch (error) {
      console.error('Error fetching supply products:', error)
      alert('載入供應產品失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此供應產品嗎？')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('supply_products')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('刪除成功！')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('刪除失敗')
    }
  }

  const toggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('supply_products')
        .update({ is_available: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchProducts()
    } catch (error) {
      console.error('Error updating availability:', error)
      alert('更新失敗')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !categoryFilter || product.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(products.map(p => p.category)))
  const totalProducts = products.length
  const availableProducts = products.filter(p => p.is_available).length
  const totalValue = products.reduce((sum, p) => sum + (p.supply_price * p.stock_quantity), 0)

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">供應產品管理</h1>
            <p className="text-gray-500 mt-1">管理提供給店家的商品目錄</p>
          </div>
          <Link
            href="/admin/supply-products/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            新增產品
          </Link>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">總產品數</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalProducts}</p>
                <p className="text-xs text-gray-400 mt-1">可供應：{availableProducts} 個</p>
              </div>
              <Package className="w-12 h-12 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">庫存總值</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  NT$ {totalValue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">以供應價計算</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">產品分類</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{categories.length}</p>
                <p className="text-xs text-gray-400 mt-1">不同類別</p>
              </div>
              <Package className="w-12 h-12 text-purple-600" />
            </div>
          </div>
        </div>

        {/* 搜尋與篩選 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="搜尋產品名稱或編號..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">所有分類</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 產品列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  產品資訊
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  分類/規格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  價格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  庫存
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>尚無供應產品</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.product_name}
                            className="w-12 h-12 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.product_name}</p>
                          <p className="text-sm text-gray-500">{product.product_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{product.category}</p>
                        <p className="text-gray-500">{product.specification || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900 font-medium">
                          供應價：NT$ {product.supply_price.toLocaleString()}
                        </p>
                        <p className="text-gray-500">
                          建議售價：NT$ {product.retail_price.toLocaleString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{product.stock_quantity} {product.unit}</p>
                        <p className="text-gray-500">最小訂購：{product.min_order_quantity} {product.unit}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleAvailability(product.id, product.is_available)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          product.is_available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.is_available ? '可供應' : '已停供'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/supply-products/${product.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
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
