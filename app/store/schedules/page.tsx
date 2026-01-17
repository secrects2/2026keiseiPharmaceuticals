'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Plus, Edit, Trash2, Clock, MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Schedule {
  id: number
  schedule_name: string
  schedule_description: string
  instructor_name: string
  schedule_date: string
  start_time: string
  end_time: string
  location: string
  max_participants: number
  current_participants: number
  is_active: boolean
}

export default function StoreSchedulesPage() {
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState<Schedule[]>([])

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
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
        .from('store_schedules')
        .select('*')
        .eq('merchant_id', merchantData.id)
        .order('schedule_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error
      setSchedules(data || [])
    } catch (error) {
      console.error('載入課程表失敗：', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteSchedule = async (scheduleId: number) => {
    if (!confirm('確定要刪除這個課程嗎？')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('store_schedules')
        .delete()
        .eq('id', scheduleId)

      if (error) throw error
      fetchSchedules()
      alert('課程已刪除')
    } catch (error) {
      console.error('刪除課程失敗：', error)
      alert('刪除失敗')
    }
  }

  // 按日期分組
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const date = schedule.schedule_date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(schedule)
    return acc
  }, {} as Record<string, Schedule[]>)

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
            <h1 className="text-3xl font-bold text-gray-900">課程表管理</h1>
            <p className="text-gray-600 mt-2">管理店家課程時間表</p>
          </div>
          <Link
            href="/store/schedules/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            新增課程
          </Link>
        </div>

        {schedules.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">尚無課程</h3>
            <p className="text-gray-600 mb-6">開始建立您的第一個課程吧！</p>
            <Link
              href="/store/schedules/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" />
              新增課程
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSchedules).map(([date, daySchedules]) => (
              <div key={date}>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {new Date(date).toLocaleDateString('zh-TW', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {daySchedules.map((schedule) => (
                    <div key={schedule.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{schedule.schedule_name}</h3>
                            {schedule.is_active ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                開放報名
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                已關閉
                              </span>
                            )}
                          </div>
                          
                          {schedule.schedule_description && (
                            <p className="text-gray-600 mb-3">{schedule.schedule_description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{schedule.start_time} - {schedule.end_time}</span>
                            </div>
                            {schedule.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{schedule.location}</span>
                              </div>
                            )}
                            {schedule.instructor_name && (
                              <div>
                                <span className="font-semibold">講師：</span>
                                {schedule.instructor_name}
                              </div>
                            )}
                            <div>
                              <span className="font-semibold">名額：</span>
                              {schedule.current_participants} / {schedule.max_participants} 人
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Link
                            href={`/store/schedules/${schedule.id}/edit`}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="編輯課程"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => deleteSchedule(schedule.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="刪除課程"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
