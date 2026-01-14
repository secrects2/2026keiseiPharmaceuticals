'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ConsultingEvent {
  id?: number
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

interface ConsultingFormModalProps {
  event?: ConsultingEvent | null
  onClose: () => void
  onSuccess: () => void
}

export default function ConsultingFormModal({ event, onClose, onSuccess }: ConsultingFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ConsultingEvent>({
    event_name: '',
    event_type: '運動諮詢',
    event_date: '',
    event_time: '',
    location: '',
    description: '',
    max_participants: 30,
    current_participants: 0,
    status: 'scheduled',
    organizer: '',
    notes: '',
  })

  const supabase = createClient()
  const isEdit = !!event

  useEffect(() => {
    if (event) {
      setFormData(event)
    }
  }, [event])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit && event?.id) {
        const { error } = await supabase
          .from('events')
          .update({
            event_name: formData.event_name,
            event_type: formData.event_type,
            event_date: formData.event_date,
            event_time: formData.event_time,
            location: formData.location,
            description: formData.description,
            max_participants: formData.max_participants ? Number(formData.max_participants) : null,
            current_participants: Number(formData.current_participants),
            status: formData.status,
            organizer: formData.organizer,
            notes: formData.notes,
          })
          .eq('id', event.id)

        if (error) throw error
        alert('顧問服務更新成功！')
      } else {
        const { error } = await supabase
          .from('events')
          .insert([{
            event_name: formData.event_name,
            event_type: formData.event_type,
            event_date: formData.event_date,
            event_time: formData.event_time,
            location: formData.location,
            description: formData.description,
            max_participants: formData.max_participants ? Number(formData.max_participants) : null,
            current_participants: Number(formData.current_participants),
            status: formData.status,
            organizer: formData.organizer,
            notes: formData.notes,
          }])

        if (error) throw error
        alert('顧問服務新增成功！')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to save event:', error)
      alert(isEdit ? '更新失敗，請稍後再試' : '新增失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {isEdit ? '編輯顧問服務' : '新增顧問服務'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                活動名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="event_name"
                value={formData.event_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                活動類型
              </label>
              <select
                name="event_type"
                value={formData.event_type || '運動諮詢'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="運動諮詢">運動諮詢</option>
                <option value="營養諮詢">營養諮詢</option>
                <option value="健康講座">健康講座</option>
                <option value="體能訓練">體能訓練</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                活動狀態 <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="scheduled">即將到來</option>
                <option value="ongoing">進行中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                活動日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                活動時間
              </label>
              <input
                type="time"
                name="event_time"
                value={formData.event_time || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                地點
              </label>
              <input
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                主辦人
              </label>
              <input
                type="text"
                name="organizer"
                value={formData.organizer || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最大參與人數
              </label>
              <input
                type="number"
                name="max_participants"
                value={formData.max_participants || ''}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目前參與人數
              </label>
              <input
                type="number"
                name="current_participants"
                value={formData.current_participants}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              活動描述
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              備註
            </label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (isEdit ? '更新中...' : '新增中...') : (isEdit ? '更新' : '新增')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
