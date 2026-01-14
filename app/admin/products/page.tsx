import { createClient } from '@/lib/supabase/server'

export default async function ProductsPage() {
  const supabase = await createClient()

  // 取得所有產品
  const { data: products, error } = await supabase
    .from('sports_products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch products:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">產品管理</h1>
          <p className="text-gray-600 mt-1">管理運動保健品的產品資訊與庫存</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          + 新增產品
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總產品數</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{products?.length || 0}</p>
            </div>
            <div className="text-3xl">📦</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">上架中</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {products?.filter(p => p.is_active).length || 0}
              </p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">已下架</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">
                {products?.filter(p => !p.is_active).length || 0}
              </p>
            </div>
            <div className="text-3xl">⏸️</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總價值</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                ${products?.reduce((sum, p) => sum + (Number(p.unit_price) || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
      </div>

      {/* 產品列表 */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">產品列表</h2>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="搜尋產品..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="">全部分類</option>
                <option value="supplement">營養補充品</option>
                <option value="equipment">運動器材</option>
                <option value="apparel">運動服飾</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  產品資訊
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分類
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  品牌
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  單價
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  成本
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
              {products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            '📦'
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.product_name}</p>
                          <p className="text-xs text-gray-500">{product.product_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.category || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.brand || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${Number(product.unit_price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ${Number(product.cost_price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {product.is_active ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          上架中
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          已下架
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                          編輯
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                          庫存
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <p className="text-4xl mb-2">📦</p>
                      <p className="text-sm">尚無產品資料</p>
                      <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                        新增第一個產品
                      </button>
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
