'use client'

import { useState } from 'react'
import { Package, Check, ShoppingCart, Sparkles } from 'lucide-react'

interface ProductBundle {
  id: number
  name: string
  description: string
  bundle_type: 'basic' | 'advanced' | 'premium'
  products: Array<{
    product_id: number
    name: string
    quantity: number
  }>
  original_price: number
  bundle_price: number
  discount_percentage: number
}

interface ProductBundleSectionProps {
  bundles: ProductBundle[]
  onSelectBundle: (bundle: ProductBundle) => void
}

const bundleConfig = {
  basic: {
    label: '基礎包',
    icon: Package,
    color: 'from-blue-500 to-cyan-500',
    badge: '適合初學者',
  },
  advanced: {
    label: '進階包',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    badge: '最受歡迎',
  },
  premium: {
    label: '豪華包',
    icon: ShoppingCart,
    color: 'from-amber-500 to-orange-500',
    badge: '物超所值',
  },
}

export default function ProductBundleSection({ bundles, onSelectBundle }: ProductBundleSectionProps) {
  const [selectedBundle, setSelectedBundle] = useState<number | null>(null)

  if (bundles.length === 0) return null

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">課程配套產品包</h3>
          <p className="text-gray-600">搭配購買更划算，一次擁有完整訓練配備</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bundles.map((bundle) => {
          const config = bundleConfig[bundle.bundle_type]
          const Icon = config.icon
          const isSelected = selectedBundle === bundle.id

          return (
            <div
              key={bundle.id}
              className={`relative bg-white rounded-xl p-6 border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-500 shadow-xl scale-105'
                  : 'border-gray-200 hover:border-indigo-300 hover:shadow-lg'
              }`}
              onClick={() => {
                setSelectedBundle(bundle.id)
                onSelectBundle(bundle)
              }}
            >
              {/* 標籤 */}
              <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r ${config.color} text-white text-sm font-semibold rounded-full shadow-lg`}>
                {config.badge}
              </div>

              {/* 圖標 */}
              <div className={`w-16 h-16 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center mb-4 mx-auto mt-2`}>
                <Icon className="w-8 h-8 text-white" />
              </div>

              {/* 標題 */}
              <h4 className="text-xl font-bold text-center text-gray-900 mb-2">
                {config.label}
              </h4>
              <p className="text-sm text-gray-600 text-center mb-4">{bundle.description}</p>

              {/* 產品列表 */}
              <div className="space-y-2 mb-4">
                {bundle.products.map((product, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>
                      {product.name} × {product.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* 價格 */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-gray-400 line-through text-sm">
                    NT$ {bundle.original_price.toLocaleString()}
                  </span>
                  <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded">
                    省 {bundle.discount_percentage}%
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-3xl font-bold text-indigo-600">
                    NT$ {bundle.bundle_price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 選中標記 */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 bg-white rounded-lg p-4 border border-indigo-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">為什麼選擇產品包？</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 組合優惠最高省 20%，比單買更划算</li>
              <li>• 一次擁有完整訓練配備，不用再煩惱</li>
              <li>• 產品經過老師精選，最適合課程使用</li>
              <li>• 可使用運動幣抵用，政府補助也能用</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
