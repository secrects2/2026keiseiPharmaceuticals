'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { ArrowLeft, Users, CheckCircle, XCircle, QrCode } from 'lucide-react'
import Link from 'next/link'

interface Registration {
  id: number
  user_id: string
  registration_code: string
  checked_in: boolean
  check_in_time: string | null
  created_at: string
  users: {
    name: string
    email: string
  }
}

export default function EventRegistrationsPage() {
  const params = useParams()
  const eventId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [eventName, setEventName] = useState('')
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    notCheckedIn: 0
  })

  useEffect(() => {
    fetchRegistrations()
  }, [eventId])

  const fetchRegistrations = async () => {
    try {
      const supabase = createClient()
      
      // 取得活動資訊
      const { data: eventData } = await supabase
        .from('store_events')
        .select('event_name')
        .eq('id', eventId)
        .single()

      if (eventData) {
        setEventName(eventData.event_name)
      }

      // 取得報名列表
      const { data, error } = await supabase
        .from('store_event_registrations')
        .select(`
          *,
          users:user_id (
            name,
            email
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const registrationData = data || []
      setRegistrations(registrationData)

      // 計算統計
      const checkedIn = registrationData.filter(r => r.checked_in).length
      setStats({
        total: registrationData.length,
        checkedIn,
        notCheckedIn: registrationData.length - checkedIn
      })
    } catch (error) {
      console.error('載入報名資料失敗：', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (registrationId: number) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('store_event_registrations')
        .update({
          checked_in: true,
          check_in_time: new Date().toISOString()
        })
        .eq('id', registrationId)

      if (error) throw error

      alert('報到成功！')
      fetchRegistrations()
    } catch (error) {
      console.error('報到失敗：', error)
      alert('報到失敗')
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
          <Link href="/store/events" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{eventName}</h1>
            <p className="text-gray-600 mt-2">活動報名列表</p>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">總報名人數</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <Users className="w-12 h-12 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已報到</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.checkedIn}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">未報到</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.notCheckedIn}</p>
              </div>
              <XCircle className="w-12 h-12 text-orange-600" />
            </div>
          </div>
        </div>

        {/* 報名列表 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">報名名單</h2>
          </div>

          {registrations.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">尚無報名資料</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">報名代碼</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">報名時間</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">報到狀態</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{reg.users?.name || '未知'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {reg.users?.email || '未知'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm">{reg.registration_code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(reg.created_at).toLocaleString('zh-TW')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reg.checked_in ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3" />
                              已報到
                            </span>
                            {reg.check_in_time && (
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(reg.check_in_time).toLocaleString('zh-TW')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <XCircle className="w-3 h-3" />
                            未報到
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {!reg.checked_in && (
                          <button
                            onClick={() => handleCheckIn(reg.id)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            手動報到
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
