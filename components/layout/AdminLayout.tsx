'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/database'

interface AdminLayoutProps {
  children: React.ReactNode
  user: User & { community?: { name: string } }
}

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navigation = [
    { name: '集團戰情室', href: '/admin', icon: '📊' },
    { name: '會員管理', href: '/admin/members', icon: '👥' },
    { name: '產品管理', href: '/admin/products', icon: '📦' },
    { name: '合作夥伴', href: '/admin/merchants', icon: '🤝' },
    { name: '顧問服務', href: '/admin/consulting', icon: '💼' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航列 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                惠生醫藥集團數位中台
              </h1>
              {user.community && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {user.community.name}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.name} ({user.role === 'admin' ? '集團管理員' : '社區管理者'})
              </span>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md disabled:opacity-50"
              >
                {loading ? '登出中...' : '登出'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 側邊欄導航 */}
      <div className="flex">
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* 主要內容區域 */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
