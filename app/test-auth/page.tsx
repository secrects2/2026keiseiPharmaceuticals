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
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">認證狀態測試</h1>
      
      <div className="space-y-6">
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">用戶狀態</h2>
          {userError && (
            <div className="text-red-600 mb-2">
              錯誤: {userError.message}
            </div>
          )}
          {user ? (
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-600">未登入</p>
          )}
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Session 狀態</h2>
          {sessionError && (
            <div className="text-red-600 mb-2">
              錯誤: {sessionError.message}
            </div>
          )}
          {session ? (
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify({
                access_token: session.access_token.substring(0, 20) + '...',
                refresh_token: session.refresh_token?.substring(0, 20) + '...',
                expires_at: session.expires_at,
                expires_in: session.expires_in,
                user: session.user?.email
              }, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-600">無 Session</p>
          )}
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Supabase Cookies</h2>
          {supabaseCookies.length > 0 ? (
            <div className="space-y-2">
              {supabaseCookies.map(cookie => (
                <div key={cookie.name} className="bg-gray-100 p-2 rounded text-sm">
                  <strong>{cookie.name}</strong>: {cookie.value.substring(0, 50)}...
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">沒有 Supabase cookies</p>
          )}
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">環境變數</h2>
          <div className="space-y-1 text-sm">
            <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || '未設定'}</p>
            <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已設定 (' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...)' : '未設定'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
