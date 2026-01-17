'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { QrCode, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function StoreCheckinPage() {
  const [loading, setLoading] = useState(false)
  const [registrationCode, setRegistrationCode] = useState('')
  const [result, setResult] = useState<{
    success: boolean
    message: string
    data?: any
  } | null>(null)

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registrationCode.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const supabase = createClient()
      
      // 查詢報名記錄
      const { data: registration, error: fetchError } = await supabase
        .from('store_event_registrations')
        .select(`
          *,
          store_events (
            event_name,
            start_time,
            end_time
          ),
          users (
            name,
            email
          )
        `)
        .eq('registration_code', registrationCode)
        .single()

      if (fetchError || !registration) {
        setResult({
          success: false,
          message: '找不到此報名代碼'
        })
        return
      }

      // 檢查是否已報到
      if (registration.check_in_status) {
        setResult({
          success: false,
          message: '此報名已完成報到',
          data: {
            userName: registration.users?.name || '未知',
            eventName: registration.store_events?.event_name || '未知',
            checkInTime: new Date(registration.check_in_time).toLocaleString('zh-TW')
          }
        })
        return
      }

      // 更新報到狀態
      const { error: updateError } = await supabase
        .from('store_event_registrations')
        .update({
          check_in_status: true,
          check_in_time: new Date().toISOString()
        })
        .eq('id', registration.id)

      if (updateError) throw updateError

      setResult({
        success: true,
        message: '報到成功！',
        data: {
          userName: registration.users?.name || '未知',
          eventName: registration.store_events?.event_name || '未知',
          checkInTime: new Date().toLocaleString('zh-TW')
        }
      })

      setRegistrationCode('')
    } catch (error) {
      console.error('報到失敗：', error)
      setResult({
        success: false,
        message: '報到失敗，請稍後再試'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/store" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">活動報到</h1>
            <p className="text-gray-600 mt-2">掃描或輸入報名代碼</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center">
              <QrCode className="w-16 h-16 text-indigo-600" />
            </div>
          </div>

          <form onSubmit={handleCheckin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                報名代碼
              </label>
              <input
                type="text"
                value={registrationCode}
                onChange={(e) => setRegistrationCode(e.target.value)}
                placeholder="請輸入報名代碼"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !registrationCode.trim()}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-semibold"
            >
              {loading ? '處理中...' : '確認報到'}
            </button>
          </form>

          {result && (
            <div className={`mt-6 p-6 rounded-lg ${result.success ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
              <div className="flex items-start gap-4">
                {result.success ? (
                  <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                    {result.message}
                  </h3>
                  {result.data && (
                    <div className="space-y-1 text-sm text-gray-700">
                      <p><span className="font-semibold">姓名：</span>{result.data.userName}</p>
                      <p><span className="font-semibold">活動：</span>{result.data.eventName}</p>
                      <p><span className="font-semibold">報到時間：</span>{result.data.checkInTime}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">使用說明</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 請參加者出示報名代碼（QR Code 或文字）</li>
              <li>• 輸入代碼後點擊「確認報到」</li>
              <li>• 系統會自動記錄報到時間</li>
              <li>• 每個代碼只能報到一次</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
