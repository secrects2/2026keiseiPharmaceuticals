import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MemberLayout from '@/components/layout/MemberLayout'
import { ToastProvider } from '@/components/Toast'
import QueryProvider from '@/components/QueryProvider'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 檢查認證
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  // 取得用戶資料
  const { data: userData, error } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', authUser.email)
    .maybeSingle()

  if (error || !userData) {
    console.error('[Member Layout] Failed to fetch user data:', error)
    redirect('/login')
  }

  // 檢查角色
  if (userData.role !== 'user') {
    redirect('/admin')
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

  const user = {
    ...userData,
    profile: profileData,
    sportCoin: coinData,
  }

  return (
    <QueryProvider>
      <ToastProvider>
        <MemberLayout user={user}>{children}</MemberLayout>
      </ToastProvider>
    </QueryProvider>
  )
}
