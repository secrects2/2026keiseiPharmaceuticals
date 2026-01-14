'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Clock, Users, MapPin, Video, Calendar, Coins, Star, CheckCircle } from 'lucide-react'

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
  end_date: string | null
  location: string | null
  video_url: string | null
  materials_url: string | null
  teacher: {
    teacher_name: string
    bio: string
    avatar_url: string | null
    average_rating: number
  }
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState<Course | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const [userCoins, setUserCoins] = useState({ government: 0, self: 0 })
  const [useGovernmentCoin, setUseGovernmentCoin] = useState(0)
  const [useSelfCoin, setUseSelfCoin] = useState(0)

  useEffect(() => {
    fetchCourseDetail()
    fetchUserCoins()
  }, [params.id])

  const fetchCourseDetail = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          teacher:teachers(teacher_name, bio, avatar_url, average_rating)
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error

      setCourse(data)
    } catch (error) {
      console.error('Error fetching course:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserCoins = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!userData) return

      const { data: coinData } = await supabase
        .from('sport_coins')
        .select('*')
        .eq('user_id', userData.id)

      let governmentCoins = 0
      let selfCoins = 0

      coinData?.forEach((coin: any) => {
        if (coin.coin_type === 'government') {
          governmentCoins += parseFloat(coin.amount || 0)
        } else {
          selfCoins += parseFloat(coin.amount || 0)
        }
      })

      setUserCoins({ government: governmentCoins, self: selfCoins })
    } catch (error) {
      console.error('Error fetching user coins:', error)
    }
  }

  const handleEnroll = async () => {
    if (!course) return

    setEnrolling(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('請先登入')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!userData) return

      // 計算實際付款金額
      const totalCoinUsed = useGovernmentCoin + useSelfCoin
      const remainingAmount = course.price - totalCoinUsed

      if (remainingAmount < 0) {
        alert('運動幣使用金額不能超過課程價格')
        return
      }

      // 檢查運動幣餘額
      if (useGovernmentCoin > userCoins.government) {
        alert('政府運動幣餘額不足')
        return
      }

      if (useSelfCoin > userCoins.self) {
        alert('自有運動幣餘額不足')
        return
      }

      // 建立報名記錄
      const { error: enrollError } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: course.id,
          user_id: userData.id,
          payment_amount: course.price,
          government_coin_used: useGovernmentCoin,
          self_coin_used: useSelfCoin,
          payment_status: 'completed',
          completion_status: 'enrolled'
        })

      if (enrollError) throw enrollError

      // 記錄運動幣交易
      if (useGovernmentCoin > 0) {
        await supabase.from('coin_transactions').insert({
          user_id: userData.id,
          transaction_type: 'use',
          coin_type: 'government',
          amount: useGovernmentCoin,
          related_type: 'course',
          related_id: course.id,
          notes: `報名課程：${course.course_name}`
        })
      }

      if (useSelfCoin > 0) {
        await supabase.from('coin_transactions').insert({
          user_id: userData.id,
          transaction_type: 'use',
          coin_type: 'self',
          amount: useSelfCoin,
          related_type: 'course',
          related_id: course.id,
          notes: `報名課程：${course.course_name}`
        })
      }

      // 更新課程學員數
      await supabase
        .from('courses')
        .update({ current_students: course.current_students + 1 })
        .eq('id', course.id)

      alert('報名成功！')
      router.push('/member/courses/my-courses')
    } catch (error: any) {
      console.error('Error enrolling:', error)
      alert(error.message || '報名失敗，請稍後再試')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">找不到課程</p>
      </div>
    )
  }

  const maxGovernmentCoin = course.government_coin_applicable ? 
    Math.min(course.max_government_coin_amount, userCoins.government, course.price) : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* 返回按鈕 */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回課程列表
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：課程詳情 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 課程封面 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-96 bg-gradient-to-br from-indigo-400 to-purple-500">
                {course.cover_image_url ? (
                  <img
                    src={course.cover_image_url}
                    alt={course.course_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Video className="w-24 h-24 text-white opacity-50" />
                  </div>
                )}
              </div>
            </div>

            {/* 課程資訊 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.course_name}</h1>
              <p className="text-gray-700 leading-relaxed mb-6">{course.course_description}</p>

              {/* 課程特色 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-indigo-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">課程時數</p>
                    <p className="font-semibold">{course.duration_hours} 小時</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-indigo-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">學員人數</p>
                    <p className="font-semibold">{course.current_students} / {course.max_students}</p>
                  </div>
                </div>
                {course.location && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-indigo-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">上課地點</p>
                      <p className="font-semibold text-sm">{course.location}</p>
                    </div>
                  </div>
                )}
                {course.start_date && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">開課日期</p>
                      <p className="font-semibold text-sm">
                        {new Date(course.start_date).toLocaleDateString('zh-TW')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 老師資訊 */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">授課老師</h3>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {course.teacher.avatar_url ? (
                      <img
                        src={course.teacher.avatar_url}
                        alt={course.teacher.teacher_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-indigo-600 font-bold text-xl">
                        {course.teacher.teacher_name[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{course.teacher.teacher_name}</h4>
                    <div className="flex items-center mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">{course.teacher.average_rating || 0} 分</span>
                    </div>
                    <p className="text-gray-700">{course.teacher.bio}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右側：報名卡片 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">課程報名</h3>
              
              {/* 價格 */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">課程價格</p>
                <p className="text-3xl font-bold text-indigo-600">NT$ {course.price}</p>
              </div>

              {/* 運動幣抵用 */}
              {course.government_coin_applicable && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">使用政府運動幣</label>
                    <span className="text-sm text-gray-600">餘額: {userCoins.government}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={maxGovernmentCoin}
                    value={useGovernmentCoin}
                    onChange={(e) => setUseGovernmentCoin(Math.min(Number(e.target.value), maxGovernmentCoin))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">最高可用 {maxGovernmentCoin} 元</p>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">使用自有運動幣</label>
                  <span className="text-sm text-gray-600">餘額: {userCoins.self}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max={Math.min(userCoins.self, course.price - useGovernmentCoin)}
                  value={useSelfCoin}
                  onChange={(e) => setUseSelfCoin(Math.min(Number(e.target.value), userCoins.self, course.price - useGovernmentCoin))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 付款摘要 */}
              <div className="border-t border-b py-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">課程價格</span>
                  <span className="font-semibold">NT$ {course.price}</span>
                </div>
                {useGovernmentCoin > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">政府運動幣</span>
                    <span className="text-green-600">- NT$ {useGovernmentCoin}</span>
                  </div>
                )}
                {useSelfCoin > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">自有運動幣</span>
                    <span className="text-green-600">- NT$ {useSelfCoin}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>實付金額</span>
                  <span className="text-indigo-600">NT$ {course.price - useGovernmentCoin - useSelfCoin}</span>
                </div>
              </div>

              {/* 報名按鈕 */}
              <button
                onClick={handleEnroll}
                disabled={enrolling || course.current_students >= course.max_students}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {enrolling ? '報名中...' : course.current_students >= course.max_students ? '名額已滿' : '立即報名'}
              </button>

              {/* 課程保證 */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>專業師資授課</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>完課頒發證書</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>課後諮詢服務</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
