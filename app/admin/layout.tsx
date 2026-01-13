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

  if (!user) {
    redirect('/login')
  }

  // 使用 email 從 users 表取得用戶詳細資訊（因為 auth.users 使用 UUID，public.users 使用 integer）
  const { data: userData, error } = await supabase
    .from('users')
    .select('*, community:communities(*)')
    .eq('email', user.email)
    .single()

  if (error || !userData) {
    console.error('Failed to fetch user data:', error)
    redirect('/login')
  }

  return <AdminLayout user={userData}>{children}</AdminLayout>
}
