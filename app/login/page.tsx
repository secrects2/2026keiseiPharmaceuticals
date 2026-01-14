'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Store, GraduationCap } from 'lucide-react'
import { login } from './actions'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
      }
      // 如果沒有錯誤，redirect 會自動執行
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            惠生醫藥集團
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            數位中台管理系統
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-semibold">錯誤</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                電子郵件
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密碼
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? '登入中...' : '登入'}
          </button>

          <div className="text-sm text-center text-gray-500">
            <p>測試帳號：admin@keiseipharm.com</p>
            <p>測試密碼：admin</p>
          </div>

          <div className="text-center">
            <a href="/register" className="text-sm text-indigo-600 hover:text-indigo-500">
              還沒有帳號？立即註冊
            </a>
          </div>
        </form>

        {/* 快速角色切換 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-4">快速進入功能畫面</p>
          <div className="grid grid-cols-3 gap-3">
            {/* 管理者 */}
            <button
              onClick={() => router.push('/admin')}
              className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 rounded-lg border border-purple-200 transition-all hover:shadow-md group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">管理者</span>
            </button>

            {/* 店家（暫時導向管理者） */}
            <button
              onClick={() => router.push('/admin')}
              className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-lg border border-blue-200 transition-all hover:shadow-md group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">店家</span>
            </button>

            {/* 授課老師 */}
            <button
              onClick={() => router.push('/teacher')}
              className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 rounded-lg border border-amber-200 transition-all hover:shadow-md group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">授課老師</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">點擊按鈕直接進入對應功能畫面（無需登入）</p>
        </div>
      </div>
    </div>
  )
}
