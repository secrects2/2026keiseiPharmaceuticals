import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/layout/AdminLayout'

export default async function Layout({
  children,
}: {
  children: React.Node
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 從 users 表取得用戶詳細資訊
  const { data: userData } = await supabase
    .from('users')
    .select('*, community:communities(*)')
    .eq('id', user.id)
    .single()

  return <AdminLayout user={userData}>{children}</AdminLayout>
}
