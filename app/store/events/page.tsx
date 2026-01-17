'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Plus, Edit, Trash2, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Event {
  id: number
  event_name: string
  event_description: string
  event_type: string
  start_time: string
  end_time: string
  location: string
  max_participants: number
  current_participants: number
  is_active: boolean
}

export default function StoreEventsPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data: merchantData } = await supabase
        .from('partner_merchants')
        .select('id')
        .eq('contact_email', user.email)
        .single()

      if (!merchantData) return

      const { data, error } = await supabase
        .from('store_events')
        .select('*')
        .eq('merchant_id', merchantData.id)
        .order('start_time', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('載入活動失敗：', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async (eventId: number) => {
    if (!confirm('確定要刪除這個活動嗎？')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('store_events')
        .delete()
        .eq('id', eventId)

      if (error) throw error
      fetchEvents()
      alert('活動已刪除')
    } catch (error) {
      console.error('刪除活動失敗：', error)
      alert('刪除失敗')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/store" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">活動管理</h1>
            <p className="text-gray-600 mt-2">建立和管理店家活動</p>
          </div>
          <Link
            href="/store/events/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            新增活動
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">尚無活動</h3>
            <p className="text-gray-600 mb-6">開始建立您的第一個活動吧！</p>
            <Link
              href="/store/events/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" />
              新增活動
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{event.event_name}</h3>
                      {event.is_active ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          進行中
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          已結束
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{event.event_description || '無描述'}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold">活動類型：</span>
                        {event.event_type || '未分類'}
                      </div>
                      <div>
                        <span className="font-semibold">地點：</span>
                        {event.location || '未設定'}
                      </div>
                      <div>
                        <span className="font-semibold">開始時間：</span>
                        {new Date(event.start_time).toLocaleString('zh-TW')}
                      </div>
                      <div>
                        <span className="font-semibold">結束時間：</span>
                        {new Date(event.end_time).toLocaleString('zh-TW')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {event.current_participants} / {event.max_participants} 人
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/store/events/${event.id}/registrations`}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                      title="查看報名"
                    >
                      <Users className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/store/events/${event.id}/edit`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="編輯活動"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="刪除活動"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
