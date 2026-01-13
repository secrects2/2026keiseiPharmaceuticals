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
  address: string | null
  phone: string | null
  manager_name: string | null
  created_at: string
}

export type MemberProfile = {
  id: string
  user_id: string
  age: number | null
  gender: string | null
  occupation: string | null
  interests: string | null
  health_status: string | null
  created_at: string
}

export type SportCoin = {
  id: string
  user_id: string
  balance: number
  total_earned: number
  total_spent: number
  created_at: string
  updated_at: string
}

export type MemberWithDetails = User & {
  community?: Community
  profile?: MemberProfile
  sport_coin?: SportCoin
}
