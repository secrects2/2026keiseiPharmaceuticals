export type User = {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  community_id: string | null
  created_at: string
}

export type Community = {
  id: string
  name: string
  code: string
  manager_id: number
  address: string | null
  phone: string | null
  email: string | null
  status: string
  member_count: number | null
  created_at: string
  updated_at: string
}

export type MemberProfile = {
  id: string
  user_id: string
  line_official_id: string | null
  birthday: string | null
  gender: string | null
  address: string | null
  interests: string | null
  tags: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type SportCoin = {
  id: string
  user_id: string
  coin_type: string
  amount: number
  source: string | null
  expiry_date: string | null
  status: string | null
  created_at: string
  updated_at: string
}

export type MemberWithDetails = User & {
  community?: Community | null
  profile?: MemberProfile | null
  sport_coin?: SportCoin | null
}
