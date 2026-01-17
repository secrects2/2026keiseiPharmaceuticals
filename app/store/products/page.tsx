'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package, Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: number
  product_name: string
  product_code: string
  category: string
  unit_price: number
  cost_price: number
  is_active: boolean
  description: string
}

export default function StoreProductsPage() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('sports_products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('載入商品失敗：', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProductStatus = async (productId: number, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('sports_products')
        .update({ is_active: !currentStatus })
        .eq('id', productId)

      if (error) throw error
      fetchProducts()
      alert(`商品已${!currentStatus ? '上架' : '下架'}`)
    } catch (error) {
      console.error('更新商品狀態失敗：', error)
      alert('操作失敗')
    }
  }

  const deleteProduct = async (productId: number) => {
    if (!confirm('確定要刪除這個商品嗎？')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('sports_products')
        .delete()
        .eq('id', productId)

      if (error) throw error
      fetchProducts()
      alert('商品已刪除')
    } catch (error) {
      console.error('刪除商品失敗：', error)
      alert('刪除失敗')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/store" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">商品管理</h1>
            <p className="text-gray-600 mt-2">管理運動用品商品</p>
          </div>
          <Link
            href="/store/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            新增商品
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">尚無商品</h3>
            <p className="text-gray-600 mb-6">開始新增您的第一個商品吧！</p>
            <Link
              href="/store/products/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" />
              新增商品
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{product.product_name}</h3>
                      <span className="text-sm text-gray-500">({product.product_code})</span>
                      {product.is_active ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          上架中
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          已下架
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{product.description || '無描述'}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold">分類：</span>
                        {product.category || '未分類'}
                      </div>
                      <div>
                        <span className="font-semibold">售價：</span>
                        NT$ {product.unit_price?.toLocaleString() || 0}
                      </div>
                      <div>
                        <span className="font-semibold">成本：</span>
                        NT$ {product.cost_price?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleProductStatus(product.id, product.is_active)}
                      className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      title={product.is_active ? '下架商品' : '上架商品'}
                    >
                      {product.is_active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <Link
                      href={`/store/products/${product.id}/edit`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="編輯商品"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="刪除商品"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
