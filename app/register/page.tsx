'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 驗證密碼
    if (password !== confirmPassword) {
      setError('密碼不一致')
      return
    }

    if (password.length < 6) {
      setError('密碼至少需要 6 個字元')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // 1. 註冊 Supabase Auth 用戶
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('註冊失敗')
      }

      // 2. 建立 public.users 記錄
      const { error: userError } = await supabase
        .from('users')
        .insert({
          email,
          role: 'user',
          community_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (userError) throw userError

      // 3. 取得剛建立的 user_id
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (!userData) throw new Error('無法取得用戶 ID')

      // 4. 建立 member_profiles 記錄
      const { error: profileError } = await supabase
        .from('member_profiles')
        .insert({
          user_id: userData.id,
          full_name: name,
          phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (profileError) throw profileError

      // 5. 建立 sport_coins 記錄（初始 100 運動幣）
      const { error: coinError } = await supabase
        .from('sport_coins')
        .insert({
          user_id: userData.id,
          amount: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (coinError) throw coinError

      // 註冊成功，重導向到登入頁
      alert('註冊成功！請登入')
      router.push('/login')
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || '註冊失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            惠生醫藥集團
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            數位中台管理系統 - 會員註冊
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                電子郵件 <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                電話 <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密碼 <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
              <p className="mt-1 text-xs text-gray-500">至少 6 個字元</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                確認密碼 <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '註冊中...' : '註冊'}
            </button>
          </div>

          <div className="text-center">
            <a href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
              已有帳號？立即登入
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
