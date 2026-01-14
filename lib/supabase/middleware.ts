import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 路由配置
const publicRoutes = ['/', '/login', '/register', '/test-auth']
const protectedRoutes = ['/admin', '/member']
const adminOnlyRoutes = ['/admin']
const memberOnlyRoutes = ['/member']

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. 效能優化：跳過靜態資源和 API 認證路由
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // 2. 建立 Supabase 客戶端並更新 session
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. 取得用戶資訊（含錯誤處理）
  let user = null
  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser()
    if (error) throw error
    user = authUser
  } catch (error) {
    console.error('[Middleware] Auth error:', error)
  }

  // 4. 效能優化：公開路由跳過認證檢查
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))
  if (isPublicRoute) {
    // 如果已登入且訪問登入頁，根據角色重導向
    if (user && pathname === '/login') {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('email', user.email)
          .maybeSingle()

        if (userData?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url))
        } else if (userData?.role === 'user') {
          return NextResponse.redirect(new URL('/member', request.url))
        }
      } catch (error) {
        console.error('[Middleware] Role check error:', error)
      }
    }
    return supabaseResponse
  }

  // 5. 路由保護：未登入用戶重導向到登入頁
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 6. 角色權限檢查
  if (user) {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .maybeSingle()

      // 檢查 admin 路由
      const isAdminRoute = adminOnlyRoutes.some(route => pathname.startsWith(route))
      if (isAdminRoute && userData?.role !== 'admin') {
        // 如果是一般會員訪問 admin，重導向到會員頁面
        if (userData?.role === 'user') {
          return NextResponse.redirect(new URL('/member', request.url))
        }
        // 其他情況重導向到登入頁
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // 檢查 member 路由
      const isMemberRoute = memberOnlyRoutes.some(route => pathname.startsWith(route))
      if (isMemberRoute && userData?.role !== 'user') {
        // 如果是管理員訪問 member，重導向到管理頁面
        if (userData?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url))
        }
        // 其他情況重導向到登入頁
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      console.error('[Middleware] Role check error:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 7. API 路由保護
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth') && !user) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    )
  }

  // 8. 日誌記錄（開發環境）
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware]', {
      path: pathname,
      user: user?.email,
      timestamp: new Date().toISOString()
    })
  }

  return supabaseResponse
}
