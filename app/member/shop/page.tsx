'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Pagination from '@/components/Pagination'
import LazyImage from '@/components/LazyImage'
import { useToast } from '@/components/Toast'

export default function ShopPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [userId, setUserId] = useState<number | null>(null)
  const [balance, setBalance] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    fetchProducts()
  }, [category, currentPage])

  const fetchProducts = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // 取得 user_id
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!userData) return

      setUserId(userData.id)

      // 取得運動幣餘額
      const { data: coinData } = await supabase
        .from('sport_coins')
        .select('amount')
        .eq('user_id', userData.id)
        .single()

      setBalance(coinData?.amount || 0)

      // 取得商品列表
      let query = supabase
        .from('sports_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      // 計算總數
      const { count } = await supabase
        .from('sports_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      const total = count || 0
      setTotalPages(Math.ceil(total / itemsPerPage))

      // 分頁查詢
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      const { data: productsData } = await query.range(from, to)

      setProducts(productsData || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async (product: any) => {
    if (!userId) return

    // 檢查餘額
    if (balance < product.price) {
      showToast('運動幣不足！', 'error')
      return
    }

    if (!confirm(`確定要兌換「${product.name}」嗎？將花費 ${product.price} 運動幣`)) {
      return
    }

    try {
      const supabase = createClient()

      // 1. 建立兌換記錄
      const { error: redemptionError } = await supabase
        .from('redemptions')
        .insert({
          user_id: userId,
          product_id: product.id,
          coins_spent: product.price,
          status: 'processing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (redemptionError) throw redemptionError

      // 2. 扣除運動幣
      const { error: coinError } = await supabase
        .from('sport_coins')
        .update({
          amount: balance - product.price,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (coinError) throw coinError

      showToast('兌換成功！', 'success')
      fetchProducts()
    } catch (error) {
      console.error('Failed to redeem:', error)
      showToast('兌換失敗，請稍後再試', 'error')
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">載入中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商品兌換</h1>
          <p className="mt-1 text-sm text-gray-600">使用運動幣兌換商品</p>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg">
          <span className="text-2xl">🪙</span>
          <div>
            <p className="text-xs opacity-90">目前餘額</p>
            <p className="text-xl font-bold">{balance}</p>
          </div>
        </div>
      </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜尋商品名稱或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            >
              <option value="all">全部分類</option>
              <option value="營養補充品">營養補充品</option>
              <option value="運動器材">運動器材</option>
              <option value="運動服飾">運動服飾</option>
            </select>
          </div>
        </div>
      </div>

      {/* 商品列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const canAfford = balance >= product.price

          return (
            <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              {product.image_url ? (
                <LazyImage
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 rounded-t-lg"
                  placeholder="📷"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <span className="text-4xl">📷</span>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                    {product.category}
                  </span>
                </div>

                {product.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-indigo-600">{product.price}</span>
                    <span className="text-lg">🪙</span>
                  </div>
                  {product.stock_quantity !== null && (
                    <span className="text-sm text-gray-500">
                      庫存：{product.stock_quantity}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleRedeem(product)}
                  disabled={!canAfford || (product.stock_quantity !== null && product.stock_quantity <= 0)}
                  className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
                    canAfford && (product.stock_quantity === null || product.stock_quantity > 0)
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {!canAfford ? '運動幣不足' :
                   (product.stock_quantity !== null && product.stock_quantity <= 0) ? '已售完' :
                   '立即兌換'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">沒有找到符合條件的商品</p>
        </div>
      )}

      {/* 分頁 */}
      {filteredProducts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}
