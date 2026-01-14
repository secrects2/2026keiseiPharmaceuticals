import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export default async function TestAuthPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession()

  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const supabaseCookies = allCookies.filter(c => c.name.startsWith('sb-'))

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">認證狀態測試</h1>
        
        <div className="space-y-6">
          <div className="border border-gray-300 bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2 text-gray-900">用戶狀態</h2>
            {userError && (
              <div className="text-red-600 mb-2 bg-red-50 p-2 rounded">
                錯誤: {userError.message}
              </div>
            )}
            {user ? (
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto text-gray-900 border border-gray-200">
                {JSON.stringify(user, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-600 bg-yellow-50 p-2 rounded">❌ 未登入</p>
            )}
          </div>

          <div className="border border-gray-300 bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2 text-gray-900">Session 狀態</h2>
            {sessionError && (
              <div className="text-red-600 mb-2 bg-red-50 p-2 rounded">
                錯誤: {sessionError.message}
              </div>
            )}
            {session ? (
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto text-gray-900 border border-gray-200">
                {JSON.stringify({
                  access_token: session.access_token.substring(0, 20) + '...',
                  refresh_token: session.refresh_token?.substring(0, 20) + '...',
                  expires_at: session.expires_at,
                  expires_in: session.expires_in,
                  user: session.user?.email
                }, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-600 bg-yellow-50 p-2 rounded">❌ 無 Session</p>
            )}
          </div>

          <div className="border border-gray-300 bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2 text-gray-900">Supabase Cookies</h2>
            {supabaseCookies.length > 0 ? (
              <div className="space-y-2">
                {supabaseCookies.map(cookie => (
                  <div key={cookie.name} className="bg-green-50 p-3 rounded text-sm border border-green-200">
                    <strong className="text-gray-900">{cookie.name}</strong>
                    <p className="text-gray-700 mt-1 break-all">{cookie.value.substring(0, 100)}...</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 bg-yellow-50 p-2 rounded">❌ 沒有 Supabase cookies</p>
            )}
          </div>

          <div className="border border-gray-300 bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2 text-gray-900">環境變數</h2>
            <div className="space-y-2">
              <div className="bg-gray-100 p-3 rounded border border-gray-200">
                <p className="text-sm text-gray-900">
                  <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ 未設定'}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded border border-gray-200">
                <p className="text-sm text-gray-900">
                  <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
                    ? '✅ 已設定 (' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 30) + '...)' 
                    : '❌ 未設定'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📋 測試步驟</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>如果環境變數顯示「未設定」，需要在 Vercel 設定環境變數</li>
              <li>前往登入頁面登入：<a href="/login" className="underline text-blue-600">/login</a></li>
              <li>登入後重新訪問此頁面，檢查用戶狀態和 cookies</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
