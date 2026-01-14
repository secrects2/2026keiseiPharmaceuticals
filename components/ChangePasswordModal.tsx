'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [loading, setLoading] = useState(false)
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  if (!isOpen) return null

  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return '密碼長度至少需要 8 個字元'
    }
    if (!/[A-Z]/.test(password)) {
      return '密碼需包含至少一個大寫字母'
    }
    if (!/[a-z]/.test(password)) {
      return '密碼需包含至少一個小寫字母'
    }
    if (!/[0-9]/.test(password)) {
      return '密碼需包含至少一個數字'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 重置錯誤
    setErrors({ newPassword: '', confirmPassword: '' })

    // 驗證新密碼
    const newPasswordError = validatePassword(passwords.newPassword)
    if (newPasswordError) {
      setErrors(prev => ({ ...prev, newPassword: newPasswordError }))
      return
    }

    // 驗證確認密碼
    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '兩次輸入的密碼不一致' }))
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      })

      if (error) throw error

      alert('密碼修改成功！')
      setPasswords({ newPassword: '', confirmPassword: '' })
      onClose()
    } catch (error: any) {
      console.error('Failed to change password:', error)
      alert(`密碼修改失敗：${error.message || '請稍後再試'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPasswords({ newPassword: '', confirmPassword: '' })
    setErrors({ newPassword: '', confirmPassword: '' })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">修改密碼</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 新密碼 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新密碼 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="請輸入新密碼"
              required
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              密碼需包含至少 8 個字元、一個大寫字母、一個小寫字母和一個數字
            </p>
          </div>

          {/* 確認密碼 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              確認密碼 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="請再次輸入新密碼"
              required
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* 按鈕 */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {loading ? '修改中...' : '確認修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
