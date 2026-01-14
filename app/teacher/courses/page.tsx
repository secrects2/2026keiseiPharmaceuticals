'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

interface Course {
  id: number
  course_name: string
  course_description: string
  course_type: string
  course_category: string
  price: number
  government_coin_applicable: boolean
  max_government_coin_amount: number
  duration_hours: number
  max_students: number
  current_students: number
  approval_status: string
  is_active: boolean
  created_at: string
}

export default function TeacherCoursesPage() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [teacherId, setTeacherId] = useState<number | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
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

      // 取得老師資訊
      const { data: teacherData } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', userData.id)
        .single()

      if (!teacherData) return

      setTeacherId(teacherData.id)

      // 取得課程列表
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', teacherData.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setCourses(data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (courseId: number, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('courses')
        .update({ is_active: !currentStatus })
        .eq('id', courseId)

      if (error) throw error

      alert(currentStatus ? '已下架課程' : '已上架課程')
      fetchCourses()
    } catch (error: any) {
      alert(error.message || '操作失敗')
    }
  }

  const handleDelete = async (courseId: number) => {
    if (!confirm('確定要刪除此課程嗎？此操作無法復原。')) return

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) throw error

      alert('課程已刪除')
      fetchCourses()
    } catch (error: any) {
      alert(error.message || '刪除失敗')
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.course_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || course.approval_status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">已核准</span>
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">待審核</span>
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">已拒絕</span>
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">{status}</span>
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">我的課程</h1>
          <Link
            href="/teacher/courses/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            新增課程
          </Link>
        </div>

        {/* 搜尋和篩選 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 搜尋 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜尋課程名稱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* 狀態篩選 */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">所有狀態</option>
              <option value="pending">待審核</option>
              <option value="approved">已核准</option>
              <option value="rejected">已拒絕</option>
            </select>
          </div>
        </div>

        {/* 課程列表 */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 mb-4">尚無課程</p>
            <Link
              href="/teacher/courses/new"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              新增第一個課程
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-md p-6">
                {/* 課程標題和狀態 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.course_name}</h3>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(course.approval_status)}
                    {course.is_active ? (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        上架中
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold flex items-center">
                        <EyeOff className="w-4 h-4 mr-1" />
                        已下架
                      </span>
                    )}
                  </div>
                </div>

                {/* 課程描述 */}
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">{course.course_description}</p>

                {/* 課程資訊 */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">類型：</span>
                    <span className="font-semibold text-gray-900">
                      {course.course_type === 'online' ? '線上' : course.course_type === 'offline' ? '實體' : '混合'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">時數：</span>
                    <span className="font-semibold text-gray-900">{course.duration_hours} 小時</span>
                  </div>
                  <div>
                    <span className="text-gray-600">學員：</span>
                    <span className="font-semibold text-gray-900">{course.current_students} / {course.max_students}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">價格：</span>
                    <span className="font-semibold text-gray-900">NT$ {course.price}</span>
                  </div>
                </div>

                {/* 操作按鈕 */}
                <div className="flex space-x-2 border-t pt-4">
                  <Link
                    href={`/teacher/courses/${course.id}/edit`}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    編輯
                  </Link>
                  {course.approval_status === 'approved' && (
                    <button
                      onClick={() => handleToggleActive(course.id, course.is_active)}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
                        course.is_active
                          ? 'bg-gray-600 text-white hover:bg-gray-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {course.is_active ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          下架
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          上架
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
