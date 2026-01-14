'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, CheckCircle, XCircle, Eye, User } from 'lucide-react'

interface Teacher {
  id: number
  teacher_name: string
  bio: string
  specialties: string[]
  qualifications: string[]
  avatar_url: string | null
  approval_status: string
  total_students: number
  average_rating: number
  created_at: string
}

export default function TeachersManagementPage() {
  const [loading, setLoading] = useState(true)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setTeachers(data || [])
    } catch (error) {
      console.error('Error fetching teachers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (teacherId: number) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('teachers')
        .update({ approval_status: 'approved' })
        .eq('id', teacherId)

      if (error) throw error

      alert('已核准老師申請')
      fetchTeachers()
    } catch (error: any) {
      alert(error.message || '核准失敗')
    }
  }

  const handleReject = async (teacherId: number) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('teachers')
        .update({ approval_status: 'rejected' })
        .eq('id', teacherId)

      if (error) throw error

      alert('已拒絕老師申請')
      fetchTeachers()
    } catch (error: any) {
      alert(error.message || '拒絕失敗')
    }
  }

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || teacher.approval_status === filterStatus
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">老師管理</h1>

        {/* 搜尋和篩選 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 搜尋 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜尋老師姓名..."
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

        {/* 老師列表 */}
        {filteredTeachers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">找不到符合條件的老師</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  {/* 老師資訊 */}
                  <div className="flex items-start space-x-4 flex-1">
                    {/* 頭像 */}
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {teacher.avatar_url ? (
                        <img
                          src={teacher.avatar_url}
                          alt={teacher.teacher_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-indigo-600 font-bold text-xl">
                          {teacher.teacher_name[0]}
                        </span>
                      )}
                    </div>

                    {/* 詳細資訊 */}
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-bold text-gray-900 mr-3">{teacher.teacher_name}</h3>
                        {getStatusBadge(teacher.approval_status)}
                      </div>
                      <p className="text-gray-700 mb-3">{teacher.bio}</p>
                      
                      {/* 專長 */}
                      {teacher.specialties && teacher.specialties.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm font-semibold text-gray-600 mr-2">專長：</span>
                          <div className="inline-flex flex-wrap gap-2">
                            {teacher.specialties.map((specialty, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-sm"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 資格證照 */}
                      {teacher.qualifications && teacher.qualifications.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm font-semibold text-gray-600 mr-2">資格證照：</span>
                          <div className="inline-flex flex-wrap gap-2">
                            {teacher.qualifications.map((qual, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-50 text-green-700 rounded text-sm"
                              >
                                {qual}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 統計資訊 */}
                      <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600">
                        <span>學員數：{teacher.total_students} 人</span>
                        <span>評分：{teacher.average_rating || 0} 分</span>
                        <span>申請日期：{new Date(teacher.created_at).toLocaleDateString('zh-TW')}</span>
                      </div>
                    </div>
                  </div>

                  {/* 操作按鈕 */}
                  {teacher.approval_status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleApprove(teacher.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        核准
                      </button>
                      <button
                        onClick={() => handleReject(teacher.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        拒絕
                      </button>
                    </div>
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
