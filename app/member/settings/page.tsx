'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import ChangePasswordModal from '@/components/ChangePasswordModal'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const handleLogout = async () => {
    if (!confirm('確定要登出嗎？')) return

    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Failed to logout:', error)
      alert('登出失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="mt-1 text-sm text-gray-600">管理您的帳號設定</p>
      </div>

      {/* 通知設定 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">通知設定</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">活動通知</p>
              <p className="text-sm text-gray-500">接收活動相關的通知</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">運動幣通知</p>
              <p className="text-sm text-gray-500">接收運動幣獲得和使用的通知</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">兌換通知</p>
              <p className="text-sm text-gray-500">接收商品兌換和配送的通知</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">系統公告</p>
              <p className="text-sm text-gray-500">接收系統維護和更新的通知</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 隱私設定 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">隱私設定</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">顯示活動記錄</p>
              <p className="text-sm text-gray-500">允許其他會員查看您的活動記錄</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">顯示運動幣餘額</p>
              <p className="text-sm text-gray-500">允許其他會員查看您的運動幣餘額</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 帳號管理 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">帳號管理</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full md:w-auto px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              修改密碼
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full md:w-auto px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? '登出中...' : '登出'}
            </button>
          </div>
        </div>
      </div>

      {/* 關於 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">關於</h2>
        </div>
        <div className="p-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">版本</span>
            <span className="text-gray-900">1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">最後更新</span>
            <span className="text-gray-900">2026-01-14</span>
          </div>
        </div>
      </div>

      {/* 密碼修改 Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  )
}
