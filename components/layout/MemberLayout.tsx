'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MemberLayoutProps {
  children: ReactNode
  user: {
    id: number
    email: string
    role: string
    profile: {
      full_name: string | null
      phone: string | null
    } | null
    sportCoin: {
      amount: number
    } | null
  }
}

export default function MemberLayout({ children, user }: MemberLayoutProps) {
  const pathname = usePathname()

  const navigation = [
    { name: '儀表板', href: '/member', icon: '📊' },
    { name: '個人資料', href: '/member/profile', icon: '👤' },
    { name: '運動幣', href: '/member/coins', icon: '🪙' },
    { name: '活動報名', href: '/member/events', icon: '📅' },
    { name: '商品兌換', href: '/member/shop', icon: '🛍️' },
    { name: '兌換記錄', href: '/member/redemptions', icon: '📦' },
    { name: '購買記錄', href: '/member/purchases', icon: '🛒' },
    { name: '活動記錄', href: '/member/activities', icon: '📋' },
    { name: '通知中心', href: '/member/notifications', icon: '🔔' },
    { name: '設定', href: '/member/settings', icon: '⚙️' },
  ]

  const handleLogout = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 頂部導航 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">惠生醫藥集團</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  {user.profile?.full_name || user.email}
                </span>
                <span className="text-sm font-semibold text-green-600">
                  🪙 {user.sportCoin?.amount || 0}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* 側邊欄 */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/member' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md
                      ${isActive
                        ? 'bg-indigo-100 text-indigo-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>

        {/* 主內容區 */}
        <div className="flex-1">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
