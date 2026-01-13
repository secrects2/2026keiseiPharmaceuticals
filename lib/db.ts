import { createClient } from '@/lib/supabase/server'
import type { MemberWithDetails } from '@/types/database'

export async function getMembers(params: {
  communityId?: string
  search?: string
  page?: number
  pageSize?: number
}) {
  const supabase = await createClient()
  const { communityId, search, page = 1, pageSize = 20 } = params
  
  let query = supabase
    .from('users')
    .select(`
      *,
      community:communities(*),
      profile:member_profiles(*),
      sport_coin:sport_coins(*)
    `)
    .order('created_at', { ascending: false })

  // 社區篩選
  if (communityId) {
    query = query.eq('community_id', communityId)
  }

  // 搜尋篩選
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  // 分頁
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching members:', error)
    return { members: [], total: 0 }
  }

  return {
    members: (data as unknown as MemberWithDetails[]) || [],
    total: count || 0,
  }
}

export async function getMemberStats(communityId?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('users')
    .select('id, created_at', { count: 'exact' })

  if (communityId) {
    query = query.eq('community_id', communityId)
  }

  const { count: totalMembers } = await query

  // 計算本月新增會員
  const firstDayOfMonth = new Date()
  firstDayOfMonth.setDate(1)
  firstDayOfMonth.setHours(0, 0, 0, 0)

  let newMembersQuery = supabase
    .from('users')
    .select('id', { count: 'exact' })
    .gte('created_at', firstDayOfMonth.toISOString())

  if (communityId) {
    newMembersQuery = newMembersQuery.eq('community_id', communityId)
  }

  const { count: newMembers } = await newMembersQuery

  // 計算活躍會員（近30天有活動記錄）
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  let activeMembersQuery
  if (communityId) {
    // 需要 JOIN users 表來篩選社區
    activeMembersQuery = supabase
      .from('member_activities')
      .select('user_id, users!inner(community_id)', { count: 'exact' })
      .gte('activity_date', thirtyDaysAgo.toISOString())
      .eq('users.community_id', communityId)
  } else {
    activeMembersQuery = supabase
      .from('member_activities')
      .select('user_id', { count: 'exact' })
      .gte('activity_date', thirtyDaysAgo.toISOString())
  }

  const { count: activeMembers } = await activeMembersQuery

  // 計算平均運動幣餘額
  let coinsQuery = supabase
    .from('sport_coins')
    .select('balance')

  if (communityId) {
    coinsQuery = coinsQuery
      .select('balance, users!inner(community_id)')
      .eq('users.community_id', communityId)
  }

  const { data: coins } = await coinsQuery
  const avgBalance = coins && coins.length > 0
    ? Math.round(coins.reduce((sum, c) => sum + (c.balance || 0), 0) / coins.length)
    : 0

  return {
    totalMembers: totalMembers || 0,
    activeMembers: activeMembers || 0,
    newMembers: newMembers || 0,
    avgBalance,
  }
}

export async function getCommunities() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching communities:', error)
    return []
  }

  return data || []
}
