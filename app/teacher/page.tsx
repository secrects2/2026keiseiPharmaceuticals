'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Users, DollarSign, Star, TrendingUp, Calendar, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface TeacherStats {
  totalCourses: number
  activeCourses: number
  totalStudents: number
  totalRevenue: number
  averageRating: number
  pendingPayouts: number
  thisMonthEnrollments: number
  thisMonthRevenue: number
}

interface RecentEnrollment {
  id: number
  enrollment_date: string
  user: {
    name: string
  }
  course: {
    course_name: string
  }
  payment_amount: number
}

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true)
  const [teacherId, setTeacherId] = useState<number | null>(null)
  const [stats, setStats] = useState<TeacherStats>({
    totalCourses: 0,
    activeCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
    pendingPayouts: 0,
    thisMonthEnrollments: 0,
    thisMonthRevenue: 0
  })
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchTeacherData()
  }, [])

  const fetchTeacherData = async () => {
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
        .select('*')
        .eq('user_id', userData.id)
        .single()

      if (!teacherData) {
        alert('您尚未註冊為老師')
        return
      }

      setTeacherId(teacherData.id)

      // 取得課程統計
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', teacherData.id)

      const totalCourses = coursesData?.length || 0
      const activeCourses = coursesData?.filter(c => c.is_active && c.approval_status === 'approved').length || 0

      // 取得學員統計
      const { data: enrollmentsData } = await supabase
        .from('course_enrollments')
        .select('*, course:courses!course_enrollments_course_id_fkey(teacher_id)')
        .eq('course.teacher_id', teacherData.id)

      const totalStudents = enrollmentsData?.length || 0

      // 計算總營收（70% 分潤）
      const totalRevenue = enrollmentsData?.reduce((sum, e) => {
        return sum + (parseFloat(e.payment_amount.toString()) * 0.7)
      }, 0) || 0

      // 本月報名數和營收
      const thisMonthStart = new Date()
      thisMonthStart.setDate(1)
      thisMonthStart.setHours(0, 0, 0, 0)

      const thisMonthEnrollments = enrollmentsData?.filter(e => 
        new Date(e.enrollment_date) >= thisMonthStart
      ).length || 0

      const thisMonthRevenue = enrollmentsData?.filter(e => 
        new Date(e.enrollment_date) >= thisMonthStart
      ).reduce((sum, e) => sum + (parseFloat(e.payment_amount.toString()) * 0.7), 0) || 0

      setStats({
        totalCourses,
        activeCourses,
        totalStudents,
        totalRevenue,
        averageRating: teacherData.average_rating || 0,
        pendingPayouts: totalRevenue, // 簡化版，實際應該扣除已提領金額
        thisMonthEnrollments,
        thisMonthRevenue
      })

      // 取得最近報名記錄
      const { data: recentData } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          user:users!course_enrollments_user_id_fkey(name),
          course:courses!course_enrollments_course_id_fkey(course_name, teacher_id)
        `)
        .eq('course.teacher_id', teacherData.id)
        .order('enrollment_date', { ascending: false })
        .limit(10)

      setRecentEnrollments(recentData || [])
    } catch (error) {
      console.error('Error fetching teacher data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!teacherId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">您尚未註冊為老師</p>
          <Link
            href="/teacher/register"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            立即註冊
          </Link>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('登出失敗：', error)
      alert('登出失敗，請稍後再試')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">老師儀表板</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            登出
          </button>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 總課程數 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">總課程數</h3>
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
            <p className="text-sm text-gray-600 mt-2">上架中：{stats.activeCourses} 個</p>
          </div>

          {/* 總學員數 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">總學員數</h3>
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
            <p className="text-sm text-gray-600 mt-2">累計報名人次</p>
          </div>

          {/* 總營收 */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">總營收</h3>
              <DollarSign className="w-8 h-8" />
            </div>
            <p className="text-3xl font-bold">NT$ {stats.totalRevenue.toLocaleString()}</p>
            <p className="text-sm opacity-90 mt-2">70% 分潤</p>
          </div>

          {/* 平均評分 */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">平均評分</h3>
              <Star className="w-8 h-8" />
            </div>
            <p className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</p>
            <p className="text-sm opacity-90 mt-2">學員評價</p>
          </div>

          {/* 本月報名 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">本月報名</h3>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.thisMonthEnrollments}</p>
            <p className="text-sm text-gray-600 mt-2">本月新增學員</p>
          </div>

          {/* 本月營收 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">本月營收</h3>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">NT$ {stats.thisMonthRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-2">70% 分潤</p>
          </div>

          {/* 待提領金額 */}
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow-md p-6 text-white col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">待提領金額</h3>
              <DollarSign className="w-8 h-8" />
            </div>
            <p className="text-3xl font-bold">NT$ {stats.pendingPayouts.toLocaleString()}</p>
            <p className="text-sm opacity-90 mt-2">可申請提領</p>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/teacher/courses"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">我的課程</h3>
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-gray-600">管理課程、上架新課程</p>
          </Link>

          <Link
            href="/teacher/students"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">學員管理</h3>
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-600">查看學員名單、頒發證書</p>
          </Link>

          <Link
            href="/teacher/revenue"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">收益查詢</h3>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-gray-600">查看收益明細、申請提領</p>
          </Link>
        </div>

        {/* 最近報名記錄 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">最近報名記錄</h2>

          {recentEnrollments.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">尚無報名記錄</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {enrollment.user?.name} 報名了「{enrollment.course?.course_name}」
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(enrollment.enrollment_date).toLocaleString('zh-TW')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">
                      NT$ {(parseFloat(enrollment.payment_amount.toString()) * 0.7).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">您的收益</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
