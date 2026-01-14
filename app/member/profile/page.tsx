'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AvatarUpload from '@/components/AvatarUpload'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    full_name: '',
    gender: '',
    birthday: '',
    phone: '',
    address: '',
    line_official_id: '',
    avatar_url: '',
  })
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
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

      // 取得會員資料
      const { data: profileData } = await supabase
        .from('member_profiles')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle()

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          gender: profileData.gender || '',
          birthday: profileData.birthday || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          line_official_id: profileData.line_official_id || '',
          avatar_url: profileData.avatar_url || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setSaving(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('member_profiles')
        .upsert({
          user_id: userId,
          ...profile,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      alert('儲存成功！')
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('儲存失敗，請稍後再試')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">載入中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">個人資料</h1>
        <p className="mt-1 text-sm text-gray-600">管理您的個人資訊</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {/* 大頭照上傳 */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          {userId && (
            <AvatarUpload
              currentAvatarUrl={profile.avatar_url}
              userId={userId}
              onUploadSuccess={(url) => setProfile({ ...profile, avatar_url: url })}
            />
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                性別
              </label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              >
                <option value="">請選擇</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                生日
              </label>
              <input
                type="date"
                value={profile.birthday}
                onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                電話 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                地址
              </label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                LINE ID
              </label>
              <input
                type="text"
                value={profile.line_official_id}
                onChange={(e) => setProfile({ ...profile, line_official_id: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '儲存中...' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
