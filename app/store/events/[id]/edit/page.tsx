'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    event_name: '',
    event_description: '',
    event_type: '',
    start_time: '',
    end_time: '',
    location: '',
    max_participants: '',
    is_active: true
  })

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('store_events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) throw error
      
      if (data) {
        setFormData({
          event_name: data.event_name || '',
          event_description: data.event_description || '',
          event_type: data.event_type || '',
          start_time: data.start_time ? new Date(data.start_time).toISOString().slice(0, 16) : '',
          end_time: data.end_time ? new Date(data.end_time).toISOString().slice(0, 16) : '',
          location: data.location || '',
          max_participants: data.max_participants?.toString() || '',
          is_active: data.is_active ?? true
        })
      }
    } catch (error) {
      console.error('載入活動失敗：', error)
      alert('載入活動失敗')
      router.push('/store/events')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('store_events')
        .update({
          event_name: formData.event_name,
          event_description: formData.event_description,
          event_type: formData.event_type,
          start_time: new Date(formData.start_time).toISOString(),
          end_time: new Date(formData.end_time).toISOString(),
          location: formData.location,
          max_participants: parseInt(formData.max_participants),
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)

      if (error) throw error

      alert('活動更新成功！')
      router.push('/store/events')
    } catch (error) {
      console.error('更新活動失敗：', error)
      alert('更新活動失敗')
    } finally {
      setSaving(false)
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
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/store/events" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">編輯活動</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                活動名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.event_name}
                onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">活動描述</label>
              <textarea
                rows={4}
                value={formData.event_description}
                onChange={(e) => setFormData({ ...formData, event_description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">活動類型</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">請選擇</option>
                  <option value="講座">講座</option>
                  <option value="體驗課程">體驗課程</option>
                  <option value="工作坊">工作坊</option>
                  <option value="比賽">比賽</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大參加人數 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始時間 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  結束時間 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                活動地點 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label className="text-sm text-gray-700">開放報名</label>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                <Save className="w-5 h-5" />
                {saving ? '儲存中...' : '儲存變更'}
              </button>
              <Link
                href="/store/events"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
