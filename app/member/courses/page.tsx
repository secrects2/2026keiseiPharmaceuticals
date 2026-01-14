'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Filter, Clock, Users, MapPin, Video, Calendar, Coins } from 'lucide-react'
import Link from 'next/link'

interface Course {
  id: number
  course_name: string
  course_description: string
  course_type: string
  course_category: string
  cover_image_url: string | null
  price: number
  government_coin_applicable: boolean
  max_government_coin_amount: number
  duration_hours: number
  max_students: number
  current_students: number
  start_date: string | null
  location: string | null
  teacher: {
    teacher_name: string
    avatar_url: string | null
  }
}

export default function CoursesPage() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const supabase = createClient()
      
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select(`
          *,
          teacher:teachers(teacher_name, avatar_url)
        `)
        .eq('approval_status', 'approved')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      setCourses(coursesData || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.course_description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || course.course_type === filterType
    const matchesCategory = filterCategory === 'all' || course.course_category === filterCategory
    return matchesSearch && matchesType && matchesCategory
  })

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">課程中心</h1>

        {/* 搜尋和篩選 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 搜尋 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜尋課程..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* 課程類型篩選 */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">所有類型</option>
              <option value="online">線上課程</option>
              <option value="offline">實體課程</option>
              <option value="hybrid">混合課程</option>
            </select>

            {/* 課程分類篩選 */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">所有分類</option>
              <option value="exercise">做運動</option>
              <option value="watch_game">看比賽</option>
            </select>
          </div>
        </div>

        {/* 課程列表 */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">找不到符合條件的課程</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Link
                key={course.id}
                href={`/member/courses/${course.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* 課程封面 */}
                <div className="relative h-48 bg-gradient-to-br from-indigo-400 to-purple-500">
                  {course.cover_image_url ? (
                    <img
                      src={course.cover_image_url}
                      alt={course.course_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Video className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                  {/* 課程類型標籤 */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white text-indigo-600 text-sm font-semibold rounded-full">
                      {getCourseTypeLabel(course.course_type)}
                    </span>
                  </div>
                  {/* 課程分類標籤 */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-indigo-600 text-white text-sm font-semibold rounded-full">
                      {getCourseCategoryLabel(course.course_category)}
                    </span>
                  </div>
                </div>

                {/* 課程資訊 */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.course_name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.course_description}</p>

                  {/* 老師資訊 */}
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                      {course.teacher.avatar_url ? (
                        <img
                          src={course.teacher.avatar_url}
                          alt={course.teacher.teacher_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-indigo-600 font-semibold text-sm">
                          {course.teacher.teacher_name[0]}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{course.teacher.teacher_name}</span>
                  </div>

                  {/* 課程詳情 */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{course.duration_hours} 小時</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{course.current_students} / {course.max_students} 人</span>
                    </div>
                    {course.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="line-clamp-1">{course.location}</span>
                      </div>
                    )}
                    {course.start_date && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(course.start_date).toLocaleDateString('zh-TW')}</span>
                      </div>
                    )}
                  </div>

                  {/* 價格和運動幣 */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-indigo-600">NT$ {course.price}</p>
                        {course.government_coin_applicable && (
                          <div className="flex items-center text-sm text-green-600 mt-1">
                            <Coins className="w-4 h-4 mr-1" />
                            <span>可用運動幣 {course.max_government_coin_amount} 元</span>
                          </div>
                        )}
                      </div>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        查看詳情
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
