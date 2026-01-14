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

  // 先取得用戶資料
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email)
    .maybeSingle()

  console.log('[Admin Layout] User data query result:', { userData, error: userError })

  if (userError) {
    console.error('[Admin Layout] Failed to fetch user data:', userError)
    redirect('/login')
  }

  if (!userData) {
    console.error('[Admin Layout] User data not found for email:', user.email)
    redirect('/login')
  }

  // 如果有 community_id，再取得 community 資料
  let communityData = null
  if (userData.community_id) {
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('*')
      .eq('id', userData.community_id)
      .maybeSingle()

    if (!communityError && community) {
      communityData = community
    }
  }

  console.log('[Admin Layout] Community data:', communityData)

  // 組合完整的用戶資料
  const fullUserData = {
    ...userData,
    community: communityData
  }

  console.log('[Admin Layout] Rendering AdminLayout with user:', fullUserData.email)

  return <AdminLayout user={fullUserData}>{children}</AdminLayout>
}
