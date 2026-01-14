'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function EventsPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('upcoming')
  const [userId, setUserId] = useState<number | null>(null)
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchEvents()
  }, [filter])

  const fetchEvents = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // 取得 user_id
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!userData) return

      setUserId(userData.id)

      // 取得已報名的活動 ID
      const { data: registrationsData } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('user_id', userData.id)

      const registeredIds = new Set(registrationsData?.map(r => r.event_id) || [])
      setRegisteredEventIds(registeredIds)

      // 取得活動列表
      let query = supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })

      // 根據篩選條件
      const now = new Date().toISOString()
      if (filter === 'upcoming') {
        query = query.gte('event_date', now)
      } else if (filter === 'past') {
        query = query.lt('event_date', now)
      }

      const { data: eventsData } = await query

      setEvents(eventsData || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (eventId: number) => {
    if (!userId) return

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('event_registrations')
        .insert({
          user_id: userId,
          event_id: eventId,
          status: 'confirmed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      alert('報名成功！')
      fetchEvents()
    } catch (error) {
      console.error('Failed to register:', error)
      alert('報名失敗，請稍後再試')
    }
  }

  const handleCancel = async (eventId: number) => {
    if (!userId) return

    if (!confirm('確定要取消報名嗎？')) return

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('user_id', userId)
        .eq('event_id', eventId)

      if (error) throw error

      alert('已取消報名')
      fetchEvents()
    } catch (error) {
      console.error('Failed to cancel:', error)
      alert('取消失敗，請稍後再試')
    }
  }

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">載入中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">活動報名</h1>
        <p className="mt-1 text-sm text-gray-600">瀏覽並報名參與活動</p>
      </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜尋活動名稱、描述或地點..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            >
              <option value="all">全部活動</option>
              <option value="upcoming">即將到來</option>
              <option value="past">已結束</option>
            </select>
          </div>
        </div>
      </div>

      {/* 活動列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const isRegistered = registeredEventIds.has(event.id)
          const isPast = new Date(event.event_date) < new Date()

          return (
            <div key={event.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                  {isRegistered && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      已報名
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📅</span>
                    {new Date(event.event_date).toLocaleString('zh-TW')}
                  </div>
                  {event.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">📍</span>
                      {event.location}
                    </div>
                  )}
                  {event.max_participants && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">👥</span>
                      名額：{event.max_participants} 人
                    </div>
                  )}
                </div>

                {event.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {event.description}
                  </p>
                )}

                {!isPast && (
                  <button
                    onClick={() => isRegistered ? handleCancel(event.id) : handleRegister(event.id)}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
                      isRegistered
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isRegistered ? '取消報名' : '立即報名'}
                  </button>
                )}

                {isPast && (
                  <div className="text-center text-sm text-gray-500">
                    活動已結束
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">沒有找到符合條件的活動</p>
        </div>
      )}
    </div>
  )
}
