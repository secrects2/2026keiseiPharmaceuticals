'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Award, CheckCircle, Users } from 'lucide-react'

interface Enrollment {
  id: number
  enrollment_date: string
  payment_amount: string
  government_coin_used: number
  self_coin_used: number
  completion_status: string
  certificate_issued: boolean
  user: {
    name: string
    email: string
  }
  course: {
    id: number
    course_name: string
  }
}

export default function TeacherStudentsPage() {
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCourse, setFilterCourse] = useState('all')
  const [courses, setCourses] = useState<{id: number, course_name: string}[]>([])

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
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

      // 取得課程列表
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, course_name')
        .eq('teacher_id', teacherData.id)

      setCourses(coursesData || [])

      // 取得學員列表
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          user:users!course_enrollments_user_id_fkey(name, email),
          course:courses!course_enrollments_course_id_fkey(id, course_name, teacher_id)
        `)
        .eq('course.teacher_id', teacherData.id)
        .order('enrollment_date', { ascending: false })

      if (error) throw error

      setEnrollments(data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleIssueCertificate = async (enrollmentId: number) => {
    if (!confirm('確定要頒發證書給此學員嗎？')) return

    try {
      const supabase = createClient()

      // 生成證書編號
      const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      const verificationCode = Math.random().toString(36).substr(2, 12).toUpperCase()

      // 建立證書記錄
      const enrollment = enrollments.find(e => e.id === enrollmentId)
      if (!enrollment) return

      const { error: certError } = await supabase
        .from('certificates')
        .insert({
          enrollment_id: enrollmentId,
          user_id: enrollment.user_id,
          course_id: enrollment.course_id,
          certificate_number: certificateNumber,
          issue_date: new Date().toISOString(),
          verification_code: verificationCode,
          is_valid: true
        })

      if (certError) throw certError

      // 更新報名記錄
      const { error: updateError } = await supabase
        .from('course_enrollments')
        .update({
          certificate_issued: true,
          completion_status: 'completed'
        })
        .eq('id', enrollmentId)

      if (updateError) throw updateError

      alert(`證書已頒發！\n證書編號：${certificateNumber}\n驗證碼：${verificationCode}`)
      fetchStudents()
    } catch (error: any) {
      alert(error.message || '頒發證書失敗')
    }
  }

  const handleMarkCompleted = async (enrollmentId: number) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('course_enrollments')
        .update({ completion_status: 'completed' })
        .eq('id', enrollmentId)

      if (error) throw error

      alert('已標記為完成')
      fetchStudents()
    } catch (error: any) {
      alert(error.message || '操作失敗')
    }
  }

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = filterCourse === 'all' || enrollment.course?.id === parseInt(filterCourse)
    return matchesSearch && matchesCourse
  })

  const getCompletionBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">已完成</span>
      case 'in_progress':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">進行中</span>
      case 'not_started':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">未開始</span>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">學員管理</h1>

        {/* 搜尋和篩選 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 搜尋 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜尋學員姓名或 Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* 課程篩選 */}
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">所有課程</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.course_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 學員列表 */}
        {filteredEnrollments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">找不到符合條件的學員</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  {/* 學員資訊 */}
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-bold text-gray-900 mr-3">{enrollment.user?.name}</h3>
                      {getCompletionBadge(enrollment.completion_status)}
                      {enrollment.certificate_issued && (
                        <span className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          已頒發證書
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{enrollment.user?.email}</p>
                    <p className="text-gray-700 mb-2">
                      <span className="font-semibold">課程：</span>{enrollment.course?.course_name}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold">報名日期：</span>
                        <span>{new Date(enrollment.enrollment_date).toLocaleDateString('zh-TW')}</span>
                      </div>
                      <div>
                        <span className="font-semibold">付款金額：</span>
                        <span>NT$ {enrollment.payment_amount}</span>
                      </div>
                      <div>
                        <span className="font-semibold">政府運動幣：</span>
                        <span>{enrollment.government_coin_used || 0}</span>
                      </div>
                      <div>
                        <span className="font-semibold">自有運動幣：</span>
                        <span>{enrollment.self_coin_used || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* 操作按鈕 */}
                  <div className="flex flex-col space-y-2 ml-4">
                    {enrollment.completion_status !== 'completed' && (
                      <button
                        onClick={() => handleMarkCompleted(enrollment.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        標記完成
                      </button>
                    )}
                    {!enrollment.certificate_issued && enrollment.completion_status === 'completed' && (
                      <button
                        onClick={() => handleIssueCertificate(enrollment.id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                      >
                        <Award className="w-4 h-4 mr-2" />
                        頒發證書
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
