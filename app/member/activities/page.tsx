'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ActivitiesPage() {
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
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

      // 取得活動參與記錄
      const { data: activitiesData } = await supabase
        .from('member_activities')
        .select('*, event:events(*)')
        .eq('user_id', userData.id)
        .order('activity_date', { ascending: false })

      setActivities(activitiesData || [])
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">載入中...</div>
      </div>
    )
  }

  // 統計資料
  const totalActivities = activities.length
  const totalDuration = activities.reduce((sum, a) => sum + (a.duration || 0), 0)
  const totalCoinsEarned = activities.reduce((sum, a) => sum + (a.coins_earned || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">活動記錄</h1>
        <p className="mt-1 text-sm text-gray-600">查看您的活動參與記錄</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">🏃</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">參與次數</p>
              <p className="text-2xl font-semibold text-gray-900">{totalActivities}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">⏱️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">總時長</p>
              <p className="text-2xl font-semibold text-gray-900">{totalDuration} 分鐘</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">🪙</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">獲得運動幣</p>
              <p className="text-2xl font-semibold text-gray-900">{totalCoinsEarned}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 活動記錄列表 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">參與明細</h2>
        </div>
        <div className="overflow-x-auto">
          {activities.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    活動名稱
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    活動類型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    時長
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    獲得運動幣
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    參與時間
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.event?.name || activity.activity_type || '未知活動'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {activity.activity_type || '一般活動'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.duration || 0} 分鐘
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-semibold text-indigo-600">
                        <span className="mr-1">{activity.coins_earned || 0}</span>
                        <span>🪙</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(activity.activity_date).toLocaleString('zh-TW')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500">尚無活動記錄</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
