'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, CheckCircle, XCircle, BookOpen, Users, Clock, Coins } from 'lucide-react'

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
  teacher: {
    teacher_name: string
  }
}

export default function CoursesManagementPage() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          teacher:teachers(teacher_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setCourses(data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (courseId: number) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('courses')
        .update({ approval_status: 'approved' })
        .eq('id', courseId)

      if (error) throw error

      alert('已核准課程上架')
      fetchCourses()
    } catch (error: any) {
      alert(error.message || '核准失敗')
    }
  }

  const handleReject = async (courseId: number) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('courses')
        .update({ approval_status: 'rejected' })
        .eq('id', courseId)

      if (error) throw error

      alert('已拒絕課程上架')
      fetchCourses()
    } catch (error: any) {
      alert(error.message || '拒絕失敗')
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

  const getCourseTypeLabel = (type: string) => {
    switch (type) {
      case 'online':
        return '線上課程'
      case 'offline':
        return '實體課程'
      case 'hybrid':
        return '混合課程'
      default:
        return type
    }
  }

  const getCourseCategoryLabel = (category: string) => {
    switch (category) {
      case 'exercise':
        return '做運動'
      case 'watch_game':
        return '看比賽'
      default:
        return category
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">課程管理</h1>

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
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">找不到符合條件的課程</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-md p-6">
                {/* 課程標題和狀態 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.course_name}</h3>
                    <p className="text-sm text-gray-600">授課老師：{course.teacher.teacher_name}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(course.approval_status)}
                    {course.is_active ? (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">上架中</span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">已下架</span>
                    )}
                  </div>
                </div>

                {/* 課程描述 */}
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">{course.course_description}</p>

                {/* 課程類型和分類 */}
                <div className="flex space-x-2 mb-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                    {getCourseTypeLabel(course.course_type)}
                  </span>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                    {getCourseCategoryLabel(course.course_category)}
                  </span>
                </div>

                {/* 課程資訊 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{course.duration_hours} 小時</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{course.current_students} / {course.max_students} 人</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-semibold">價格：</span>
                    <span className="ml-1">NT$ {course.price}</span>
                  </div>
                  {course.government_coin_applicable && (
                    <div className="flex items-center text-sm text-green-600">
                      <Coins className="w-4 h-4 mr-2" />
                      <span>可用運動幣 {course.max_government_coin_amount}</span>
                    </div>
                  )}
                </div>

                {/* 操作按鈕 */}
                <div className="flex space-x-2 border-t pt-4">
                  {course.approval_status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(course.id)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        核准
                      </button>
                      <button
                        onClick={() => handleReject(course.id)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        拒絕
                      </button>
                    </>
                  )}
                  {course.approval_status === 'approved' && (
                    <button
                      onClick={() => handleToggleActive(course.id, course.is_active)}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                        course.is_active
                          ? 'bg-gray-600 text-white hover:bg-gray-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {course.is_active ? '下架課程' : '上架課程'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
