'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewSchedulePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    schedule_name: '',
    schedule_description: '',
    instructor_name: '',
    schedule_date: '',
    start_time: '',
    end_time: '',
    location: '',
    max_participants: '20',
    is_active: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('請先登入')
        return
      }

      // 取得店家資訊
      const { data: merchantData } = await supabase
        .from('partner_merchants')
        .select('id')
        .eq('contact_email', user.email)
        .single()

      if (!merchantData) {
        alert('找不到店家資訊')
        return
      }

      const { error } = await supabase
        .from('store_schedules')
        .insert({
          merchant_id: merchantData.id,
          schedule_name: formData.schedule_name,
          schedule_description: formData.schedule_description,
          instructor_name: formData.instructor_name,
          schedule_date: formData.schedule_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          location: formData.location,
          max_participants: parseInt(formData.max_participants),
          current_participants: 0,
          is_active: formData.is_active,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      alert('課程建立成功！')
      router.push('/store/schedules')
    } catch (error) {
      console.error('建立課程失敗：', error)
      alert('建立課程失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/store/schedules" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">新增課程</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                課程名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.schedule_name}
                onChange={(e) => setFormData({ ...formData, schedule_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="例如：瑜珈入門班、重訓基礎課程"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">課程描述</label>
              <textarea
                rows={3}
                value={formData.schedule_description}
                onChange={(e) => setFormData({ ...formData, schedule_description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="課程內容、適合對象、需攜帶物品等"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">講師姓名</label>
                <input
                  type="text"
                  value={formData.instructor_name}
                  onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="授課講師"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  課程日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.schedule_date}
                  onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始時間 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
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
                  type="time"
                  required
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  上課地點 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="例如：教室 A、戶外廣場"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大人數 <span className="text-red-500">*</span>
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
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label className="text-sm text-gray-700">立即開放報名</label>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                <Save className="w-5 h-5" />
                {loading ? '建立中...' : '建立課程'}
              </button>
              <Link
                href="/store/schedules"
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
