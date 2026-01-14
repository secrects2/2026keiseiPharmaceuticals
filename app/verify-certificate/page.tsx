'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, CheckCircle, XCircle, Award } from 'lucide-react'

interface CertificateInfo {
  certificate_number: string
  issue_date: string
  is_valid: boolean
  user: {
    name: string
  }
  course: {
    course_name: string
    duration_hours: number
  }
  teacher: {
    teacher_name: string
  }
}

export default function VerifyCertificatePage() {
  const [loading, setLoading] = useState(false)
  const [searchType, setSearchType] = useState<'number' | 'code'>('number')
  const [searchValue, setSearchValue] = useState('')
  const [result, setResult] = useState<CertificateInfo | null>(null)
  const [error, setError] = useState('')

  const handleVerify = async () => {
    if (!searchValue.trim()) {
      setError('請輸入證書編號或驗證碼')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const supabase = createClient()

      const column = searchType === 'number' ? 'certificate_number' : 'verification_code'
      
      const { data, error: queryError } = await supabase
        .from('certificates')
        .select(`
          certificate_number,
          issue_date,
          is_valid,
          user:users!certificates_user_id_fkey(name),
          course:courses!certificates_course_id_fkey(course_name, duration_hours, teacher_id),
          teacher:teachers!certificates_course_id_fkey(teacher_name)
        `)
        .eq(column, searchValue.trim())
        .single()

      if (queryError || !data) {
        setError('找不到此證書，請確認編號或驗證碼是否正確')
        return
      }

      setResult(data as any)
    } catch (error) {
      console.error('Error verifying certificate:', error)
      setError('驗證失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* 標題 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Award className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">證書驗證</h1>
          <p className="text-gray-600">輸入證書編號或驗證碼以驗證證書真偽</p>
        </div>

        {/* 搜尋表單 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* 搜尋類型選擇 */}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setSearchType('number')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                searchType === 'number'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              證書編號
            </button>
            <button
              onClick={() => setSearchType('code')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                searchType === 'code'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              驗證碼
            </button>
          </div>

          {/* 搜尋輸入 */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={searchType === 'number' ? '輸入證書編號...' : '輸入驗證碼...'}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 驗證按鈕 */}
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '驗證中...' : '驗證證書'}
          </button>

          {/* 錯誤訊息 */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <XCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* 驗證結果 */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* 驗證狀態 */}
            <div className={`flex items-center justify-center mb-6 p-4 rounded-lg ${
              result.is_valid
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-red-50 border-2 border-red-200'
            }`}>
              {result.is_valid ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-xl font-bold text-green-900">證書有效</p>
                    <p className="text-sm text-green-700">此證書為真實有效的證書</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-xl font-bold text-red-900">證書已失效</p>
                    <p className="text-sm text-red-700">此證書已被撤銷或過期</p>
                  </div>
                </>
              )}
            </div>

            {/* 證書資訊 */}
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">證書編號</h3>
                <p className="text-lg font-mono text-gray-900">{result.certificate_number}</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">學員姓名</h3>
                <p className="text-lg text-gray-900">{result.user?.name}</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">課程名稱</h3>
                <p className="text-lg text-gray-900">{result.course?.course_name}</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">課程時數</h3>
                <p className="text-lg text-gray-900">{result.course?.duration_hours} 小時</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">授課老師</h3>
                <p className="text-lg text-gray-900">{result.teacher?.teacher_name || 'N/A'}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">頒發日期</h3>
                <p className="text-lg text-gray-900">
                  {new Date(result.issue_date).toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* 說明 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>提示：</strong>此證書由惠生醫藥集團運動幣平台頒發。
                如對證書真偽有疑問，請聯繫平台客服。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
