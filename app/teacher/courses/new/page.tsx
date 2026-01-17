'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    course_name: '',
    course_description: '',
    course_type: 'online',
    course_category: '',
    price: '',
    government_coin_applicable: false,
    max_government_coin_amount: '',
    duration_hours: '',
    max_students: '',
    start_date: '',
    end_date: '',
    location: '',
    cover_image_url: '',
    is_active: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 預覽圖片
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // 上傳到 Supabase Storage
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `course-covers/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('course-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('course-images')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, cover_image_url: publicUrl }))
    } catch (error) {
      console.error('上傳圖片失敗：', error)
      alert('上傳圖片失敗，請稍後再試')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      // 取得當前用戶
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('請先登入')
        return
      }

      // 取得 user_id
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!userData) {
        alert('找不到用戶資料')
        return
      }

      // 取得 teacher_id
      const { data: teacherData } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', userData.id)
        .single()

      if (!teacherData) {
        alert('您尚未註冊為老師')
        return
      }

      // 建立課程
      const { error } = await supabase
        .from('courses')
        .insert({
          teacher_id: teacherData.id,
          course_name: formData.course_name,
          course_description: formData.course_description,
          course_type: formData.course_type,
          course_category: formData.course_category,
          price: parseFloat(formData.price) || 0,
          government_coin_applicable: formData.government_coin_applicable,
          max_government_coin_amount: formData.max_government_coin_amount ? parseFloat(formData.max_government_coin_amount) : null,
          duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : null,
          max_students: formData.max_students ? parseInt(formData.max_students) : null,
          current_students: 0,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          location: formData.location || null,
          cover_image_url: formData.cover_image_url || null,
          approval_status: 'pending',
          is_active: formData.is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      alert('課程建立成功！')
      router.push('/teacher/courses')
    } catch (error) {
      console.error('建立課程失敗：', error)
      alert('建立課程失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/teacher/courses"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            返回課程列表
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">新增課程</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 課程基本資訊 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">基本資訊</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  課程名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="course_name"
                  value={formData.course_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="例如：運動防護員培訓課程"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  課程描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="course_description"
                  value={formData.course_description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="詳細描述課程內容、目標、適合對象等..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    課程類型 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="course_type"
                    value={formData.course_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="online">線上課程</option>
                    <option value="offline">實體課程</option>
                    <option value="hybrid">混合式</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    課程分類
                  </label>
                  <input
                    type="text"
                    name="course_category"
                    value={formData.course_category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="例如：運動防護、健康管理"
                  />
                </div>
              </div>
            </div>

            {/* 價格設定 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">價格設定</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    課程價格 (NT$) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最大運動幣抵用額 (NT$)
                  </label>
                  <input
                    type="number"
                    name="max_government_coin_amount"
                    value={formData.max_government_coin_amount}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="government_coin_applicable"
                  checked={formData.government_coin_applicable}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label className="text-sm text-gray-700">
                  允許使用運動幣抵用
                </label>
              </div>
            </div>

            {/* 課程時間與人數 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">課程時間與人數</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    課程時數 (小時)
                  </label>
                  <input
                    type="number"
                    name="duration_hours"
                    value={formData.duration_hours}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="例如：8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最大學員數
                  </label>
                  <input
                    type="number"
                    name="max_students"
                    value={formData.max_students}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="例如：30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    開課日期
                  </label>
                  <input
                    type="datetime-local"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    結束日期
                  </label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  上課地點
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="例如：台北市信義區信義路五段7號"
                />
              </div>
            </div>

            {/* 課程封面 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">課程封面</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  上傳封面圖片
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">選擇圖片</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="預覽"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 課程狀態 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">課程狀態</h2>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label className="text-sm text-gray-700">
                  立即上架（審核通過後自動上架）
                </label>
              </div>
            </div>

            {/* 提交按鈕 */}
            <div className="flex items-center gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {loading ? '建立中...' : '建立課程'}
              </button>
              <Link
                href="/teacher/courses"
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
