import { createClient } from '@/lib/supabase/server'
import { getMemberStats } from '@/lib/db'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 取得用戶資訊以判斷社區篩選
  const { data: userData } = await supabase
    .from('users')
    .select('role, community_id')
    .eq('email', user?.email)
    .single()

  const communityId = userData?.role === 'admin' ? undefined : userData?.community_id

  // 取得統計數據
  const stats = await getMemberStats(communityId)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">集團戰情室</h1>
        <p className="mt-2 text-gray-600">
          即時掌握業務指標與營運概況
        </p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="總會員數"
          value={stats.totalMembers}
          unit="人"
          icon="👥"
          color="blue"
        />
        <StatCard
          title="活躍會員數"
          value={stats.activeMembers}
          unit="人"
          icon="⚡"
          color="green"
        />
        <StatCard
          title="本月新增會員"
          value={stats.newMembers}
          unit="人"
          icon="📈"
          color="purple"
        />
        <StatCard
          title="平均運動幣餘額"
          value={stats.avgBalance}
          unit="點"
          icon="🪙"
          color="yellow"
        />
      </div>

      {/* 圖表區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            營收趨勢
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            圖表開發中...
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            會員活躍度
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            圖表開發中...
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  unit,
  icon,
  color,
}: {
  title: string
  value: number
  unit: string
  icon: string
  color: 'blue' | 'green' | 'purple' | 'yellow'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    yellow: 'bg-yellow-50 text-yellow-700',
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {value.toLocaleString()}
            <span className="text-lg font-normal text-gray-500 ml-1">{unit}</span>
          </p>
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  )
}
