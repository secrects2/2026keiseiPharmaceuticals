'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ConsultingFormModal from '@/components/ConsultingFormModal'

interface Event {
  id: number
  event_name: string
  event_type: string | null
  event_date: string
  event_time: string | null
  location: string | null
  description: string | null
  max_participants: number | null
  current_participants: number
  status: string
  organizer: string | null
  notes: string | null
}

export default function ConsultingPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [timeFilter, setTimeFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const supabase = createClient()

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))

    const now = new Date()
    const eventDate = new Date(event.event_date)
    const matchesTime = 
      !timeFilter ||
      (timeFilter === 'upcoming' && eventDate > now) ||
      (timeFilter === 'completed' && eventDate < now)

    return matchesSearch && matchesTime
  })

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此顧問服務嗎？')) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('顧問服務刪除成功！')
      fetchEvents()
    } catch (error) {
      console.error('Failed to delete event:', error)
      alert('刪除失敗，請稍後再試')
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingEvent(null)
    setShowModal(true)
  }

  const stats = {
    total: events.length,
    thisMonth: events.filter(e => {
      const eventDate = new Date(e.event_date)
      const now = new Date()
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
    }).length,
    upcoming: events.filter(e => new Date(e.event_date) > new Date()).length,
    completed: events.filter(e => new Date(e.event_date) < new Date()).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">載入中...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">顧問服務</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>新增服務活動</span>
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總服務數</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="text-3xl">💼</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">本月服務</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.thisMonth}</p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">即將到來</p>
              <p className="text-2xl font-bold text-green-600">{stats.upcoming}</p>
            </div>
            <div className="text-3xl">⏰</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">已完成</p>
              <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
      </div>

      {/* 服務列表 */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="搜尋活動名稱、描述或地點..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">所有活動</option>
              <option value="upcoming">即將到來</option>
              <option value="completed">已完成</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">活動名稱</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">類型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期時間</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">地點</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">參與人數</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvents.map((event) => {
                const eventDate = new Date(event.event_date)
                const isUpcoming = eventDate > new Date()
                
                return (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{event.event_name}</p>
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-1">{event.description.substring(0, 50)}...</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{event.event_type || '-'}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{eventDate.toLocaleDateString('zh-TW')}</p>
                      {event.event_time && (
                        <p className="text-sm text-gray-500">{event.event_time}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{event.location || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {event.current_participants}
                      {event.max_participants && ` / ${event.max_participants}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                        event.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status === 'scheduled' && '即將到來'}
                        {event.status === 'ongoing' && '進行中'}
                        {event.status === 'completed' && '已完成'}
                        {event.status === 'cancelled' && '已取消'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              沒有找到符合條件的顧問服務
            </div>
          )}
        </div>
      </div>

      {/* 快速統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">近期活動</h3>
          <div className="space-y-3">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.event_name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(event.event_date).toLocaleDateString('zh-TW')}
                  </p>
                </div>
                <div className="text-2xl">
                  {new Date(event.event_date) > new Date() ? '⏰' : '✅'}
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">暫無活動</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">服務類型分布</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🏃</div>
                <span className="text-sm font-medium text-gray-900">運動諮詢</span>
              </div>
              <span className="text-sm font-bold text-blue-600">
                {events.filter(e => e.event_type === '運動諮詢' || e.event_name.includes('運動')).length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🥗</div>
                <span className="text-sm font-medium text-gray-900">營養諮詢</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                {events.filter(e => e.event_type === '營養諮詢' || e.event_name.includes('營養')).length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🧘</div>
                <span className="text-sm font-medium text-gray-900">健康講座</span>
              </div>
              <span className="text-sm font-bold text-purple-600">
                {events.filter(e => e.event_type === '健康講座' || e.event_name.includes('講座')).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <ConsultingFormModal
          event={editingEvent}
          onClose={() => {
            setShowModal(false)
            setEditingEvent(null)
          }}
          onSuccess={fetchEvents}
        />
      )}
    </div>
  )
}
