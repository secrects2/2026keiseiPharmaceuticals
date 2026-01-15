'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MemberLayout from '@/components/layout/MemberLayout'
import { ToastProvider } from '@/components/Toast'
import QueryProvider from '@/components/QueryProvider'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()

      // 檢查認證
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/login')
        return
      }

      // 取得用戶資料
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('email', authUser.email)
        .maybeSingle()

      if (error || !userData) {
        console.error('[Member Layout] Failed to fetch user data:', error)
        router.push('/login')
        return
      }

      // 檢查角色
      if (userData.role !== 'user') {
        router.push('/admin')
        return
      }

      // 取得會員資料
      const { data: profileData } = await supabase
        .from('member_profiles')
        .select('full_name, phone')
        .eq('user_id', userData.id)
        .maybeSingle()

      // 取得運動幣餘額
      const { data: coinData } = await supabase
        .from('sport_coins')
        .select('amount')
        .eq('user_id', userData.id)
        .maybeSingle()

      setUser({
        ...userData,
        profile: profileData,
        sportCoin: coinData,
      })
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <QueryProvider>
      <ToastProvider>
        <MemberLayout user={user}>{children}</MemberLayout>
      </ToastProvider>
    </QueryProvider>
  )
}
