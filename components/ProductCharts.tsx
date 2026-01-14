'use client'

import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

interface Product {
  id: number
  product_name: string
  category: string | null
  brand: string | null
  unit_price: number
  cost_price: number
  is_active: boolean
}

interface ProductChartsProps {
  products: Product[]
}

export default function ProductCharts({ products }: ProductChartsProps) {
  // 分類分布數據
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {}
    products.forEach(p => {
      const cat = p.category || '未分類'
      categories[cat] = (categories[cat] || 0) + 1
    })

    return {
      labels: Object.keys(categories),
      datasets: [
        {
          label: '產品數量',
          data: Object.values(categories),
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(234, 179, 8, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(168, 85, 247, 0.8)',
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(234, 179, 8, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(168, 85, 247, 1)',
          ],
          borderWidth: 2,
        },
      ],
    }
  }, [products])

  // 品牌分布數據（前5名）
  const brandData = useMemo(() => {
    const brands: Record<string, number> = {}
    products.forEach(p => {
      const brand = p.brand || '未知品牌'
      brands[brand] = (brands[brand] || 0) + 1
    })

    const sortedBrands = Object.entries(brands)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    return {
      labels: sortedBrands.map(([brand]) => brand),
      datasets: [
        {
          label: '產品數量',
          data: sortedBrands.map(([, count]) => count),
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
        },
      ],
    }
  }, [products])

  // 價格分布數據
  const priceData = useMemo(() => {
    const priceRanges = {
      '0-500': 0,
      '501-1000': 0,
      '1001-2000': 0,
      '2001-5000': 0,
      '5000+': 0,
    }

    products.forEach(p => {
      const price = Number(p.unit_price)
      if (price <= 500) priceRanges['0-500']++
      else if (price <= 1000) priceRanges['501-1000']++
      else if (price <= 2000) priceRanges['1001-2000']++
      else if (price <= 5000) priceRanges['2001-5000']++
      else priceRanges['5000+']++
    })

    return {
      labels: Object.keys(priceRanges),
      datasets: [
        {
          label: '產品數量',
          data: Object.values(priceRanges),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
        },
      ],
    }
  }, [products])

  // 上架狀態數據
  const statusData = useMemo(() => {
    const active = products.filter(p => p.is_active).length
    const inactive = products.filter(p => !p.is_active).length

    return {
      labels: ['上架中', '已下架'],
      datasets: [
        {
          data: [active, inactive],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(156, 163, 175, 0.8)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(156, 163, 175, 1)',
          ],
          borderWidth: 2,
        },
      ],
    }
  }, [products])

  // 利潤率趨勢（前10個產品）
  const profitData = useMemo(() => {
    const topProducts = products
      .slice(0, 10)
      .map(p => ({
        name: p.product_name.length > 15 
          ? p.product_name.substring(0, 15) + '...' 
          : p.product_name,
        profitRate: ((Number(p.unit_price) - Number(p.cost_price)) / Number(p.cost_price) * 100).toFixed(1)
      }))

    return {
      labels: topProducts.map(p => p.name),
      datasets: [
        {
          label: '利潤率 (%)',
          data: topProducts.map(p => Number(p.profitRate)),
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    }
  }, [products])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 分類分布 */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">產品分類分布</h3>
        <div className="h-64">
          <Doughnut data={categoryData} options={doughnutOptions} />
        </div>
      </div>

      {/* 品牌分布 */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">品牌分布（前5名）</h3>
        <div className="h-64">
          <Bar data={brandData} options={chartOptions} />
        </div>
      </div>

      {/* 價格分布 */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">價格區間分布</h3>
        <div className="h-64">
          <Bar data={priceData} options={chartOptions} />
        </div>
      </div>

      {/* 上架狀態 */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">上架狀態分布</h3>
        <div className="h-64">
          <Doughnut data={statusData} options={doughnutOptions} />
        </div>
      </div>

      {/* 利潤率趨勢 */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 md:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">產品利潤率（前10個產品）</h3>
        <div className="h-64">
          <Line data={profitData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}
