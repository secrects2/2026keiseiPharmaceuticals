'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      // 模擬通知資料（未來可連接真實通知系統）
      const mockNotifications = [
        {
          id: 1,
          type: 'event',
          title: '活動提醒',
          message: '您報名的「健康講座」將於明天下午 2:00 開始',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 分鐘前
        },
        {
          id: 2,
          type: 'coin',
          title: '運動幣獲得',
          message: '恭喜您獲得 50 運動幣！',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 小時前
        },
        {
          id: 3,
          type: 'redemption',
          title: '兌換成功',
          message: '您兌換的「蛋白粉」已處理完成，預計 3-5 個工作天送達',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 天前
        },
        {
          id: 4,
          type: 'system',
          title: '系統公告',
          message: '系統將於本週日凌晨 2:00-4:00 進行維護',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 天前
        },
      ]

      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, is_read: true } : n
    ))
  }

  const handleMarkAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
  }

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除這則通知嗎？')) return
    setNotifications(notifications.filter(n => n.id !== id))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">載入中...</div>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event': return '📅'
      case 'coin': return '🪙'
      case 'redemption': return '📦'
      case 'system': return '🔔'
      default: return '💬'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">通知中心</h1>
          <p className="mt-1 text-sm text-gray-600">
            {unreadCount > 0 ? `您有 ${unreadCount} 則未讀通知` : '沒有未讀通知'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            全部標記為已讀
          </button>
        )}
      </div>

      {/* 通知列表 */}
      <div className="bg-white rounded-lg shadow">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString('zh-TW')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs text-indigo-600 hover:text-indigo-700"
                          >
                            標記已讀
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <span className="text-6xl mb-4 block">📭</span>
            <p className="text-gray-500">沒有任何通知</p>
          </div>
        )}
      </div>
    </div>
  )
}
