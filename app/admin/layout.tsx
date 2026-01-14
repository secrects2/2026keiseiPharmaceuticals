import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/layout/AdminLayout'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('[Admin Layout] Auth user:', user?.email)

  if (!user) {
    console.log('[Admin Layout] No auth user, redirecting to login')
    redirect('/login')
  }

  // 使用 email 從 users 表取得用戶詳細資訊（因為 auth.users 使用 UUID，public.users 使用 integer）
  const { data: userData, error } = await supabase
    .from('users')
    .select('*, community:communities(*)')
    .eq('email', user.email)
    .maybeSingle() // 使用 maybeSingle() 而非 single()，避免 PGRST116 錯誤

  console.log('[Admin Layout] User data query result:', { userData, error })

  // 如果查詢失敗（不是找不到資料，而是真的錯誤），記錄錯誤並重導向
  if (error) {
    console.error('[Admin Layout] Failed to fetch user data:', error)
    redirect('/login')
  }

  // 如果找不到用戶資料，也重導向
  if (!userData) {
    console.error('[Admin Layout] User data not found for email:', user.email)
    redirect('/login')
  }

  console.log('[Admin Layout] Rendering AdminLayout with user:', userData.email)

  return <AdminLayout user={userData}>{children}</AdminLayout>
}
