import { createClient } from '@/lib/supabase/server'
import { getMembers, getMemberStats } from '@/lib/db'
import MembersTable from '@/components/MembersTable'

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 取得用戶資訊以判斷社區篩選
  const { data: userData } = await supabase
    .from('users')
    .select('role, community_id')
    .eq('id', user?.id)
    .single()

  const communityId = userData?.role === 'admin' ? undefined : userData?.community_id
  const page = params.page ? parseInt(params.page) : 1
  const search = params.search || ''

  // 取得會員列表
  const { members, total } = await getMembers({
    communityId,
    search,
    page,
    pageSize: 20,
  })

  // 取得統計數據
  const stats = await getMemberStats(communityId)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">會員管理</h1>
        <p className="mt-2 text-gray-600">
          管理會員資料、查看活動記錄與運動幣餘額
        </p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="總會員數" value={stats.totalMembers} unit="人" />
        <StatCard title="活躍會員數" value={stats.activeMembers} unit="人" />
        <StatCard title="本月新增" value={stats.newMembers} unit="人" />
        <StatCard title="平均運動幣" value={stats.avgBalance} unit="點" />
      </div>

      {/* 會員表格 */}
      <MembersTable
        members={members}
        total={total}
        currentPage={page}
        search={search}
      />
    </div>
  )
}

function StatCard({
  title,
  value,
  unit,
}: {
  title: string
  value: number
  unit: string
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value.toLocaleString()}
        <span className="text-lg font-normal text-gray-500 ml-1">{unit}</span>
      </p>
    </div>
  )
}
