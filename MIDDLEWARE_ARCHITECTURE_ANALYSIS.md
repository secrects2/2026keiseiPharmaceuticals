# Middleware 架構分析報告

## 📋 現有架構分析

### 當前實現

您目前的 middleware 架構非常簡單：

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// lib/supabase/middleware.ts
export async function updateSession(request: NextRequest) {
  // 1. 建立 Supabase 客戶端
  // 2. 取得用戶資訊
  // 3. 更新 session cookies
  // 4. 返回 response（沒有任何重導向邏輯）
}
```

### ⚠️ 缺少的架構

根據現代 Next.js + Supabase 應用的最佳實踐，您的 middleware 缺少以下關鍵架構：

## 1. ❌ 路由保護 (Route Protection)

**問題：** 目前沒有任何路由保護邏輯，任何人都可以訪問 `/admin/*` 路徑。

**應該有：**
- 公開路由（`/`, `/login`, `/test-auth`）：任何人都可以訪問
- 受保護路由（`/admin/*`）：只有登入用戶可以訪問
- 角色路由（`/admin/*`）：只有特定角色（如 admin）可以訪問

**實現方式：**
```typescript
// 檢查用戶是否登入
if (!user && isProtectedRoute) {
  return NextResponse.redirect(new URL('/login', request.url))
}

// 檢查用戶角色
if (user && isAdminRoute && user.role !== 'admin') {
  return NextResponse.redirect(new URL('/unauthorized', request.url))
}
```

## 2. ❌ 路由配置 (Route Configuration)

**問題：** 沒有明確定義哪些路由是公開的、哪些是受保護的。

**應該有：**
```typescript
const publicRoutes = ['/', '/login', '/test-auth']
const protectedRoutes = ['/admin']
const adminOnlyRoutes = ['/admin/settings']
```

## 3. ❌ 登入後重導向 (Post-Login Redirect)

**問題：** 用戶登入後總是跳轉到 `/admin`，沒有記住用戶原本想訪問的頁面。

**應該有：**
```typescript
// 用戶訪問 /admin/products 但未登入
// → 重導向到 /login?redirect=/admin/products
// → 登入後自動跳轉回 /admin/products
```

## 4. ❌ 角色權限檢查 (Role-Based Access Control)

**問題：** 沒有檢查用戶角色，任何登入用戶都可以訪問所有 admin 頁面。

**應該有：**
```typescript
// 從資料庫取得用戶角色
const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('email', user.email)
  .single()

// 檢查角色權限
if (userData?.role !== 'admin') {
  return NextResponse.redirect(new URL('/unauthorized', request.url))
}
```

## 5. ❌ Session 刷新邏輯 (Session Refresh)

**問題：** 沒有主動刷新 session，可能導致用戶 session 過期。

**應該有：**
```typescript
// 定期刷新 session
const { data: { session } } = await supabase.auth.getSession()
if (session) {
  await supabase.auth.refreshSession()
}
```

## 6. ❌ 錯誤處理 (Error Handling)

**問題：** 沒有錯誤處理，如果 Supabase 連接失敗會導致整個應用崩潰。

**應該有：**
```typescript
try {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Auth error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
} catch (error) {
  console.error('Middleware error:', error)
  return NextResponse.next()
}
```

## 7. ❌ API 路由保護 (API Route Protection)

**問題：** 沒有保護 API 路由，任何人都可以調用 API。

**應該有：**
```typescript
// 檢查 API 路由
if (request.nextUrl.pathname.startsWith('/api')) {
  if (!user) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    )
  }
}
```

## 8. ❌ 日誌記錄 (Logging)

**問題：** 沒有日誌記錄，無法追蹤用戶訪問和認證問題。

**應該有：**
```typescript
console.log('[Middleware]', {
  path: request.nextUrl.pathname,
  user: user?.email,
  timestamp: new Date().toISOString()
})
```

## 9. ❌ 效能優化 (Performance Optimization)

**問題：** 每個請求都會調用 `supabase.auth.getUser()`，可能影響效能。

**應該有：**
```typescript
// 只在必要時檢查認證
const isPublicRoute = publicRoutes.some(route => 
  request.nextUrl.pathname.startsWith(route)
)

if (isPublicRoute) {
  return supabaseResponse // 跳過認證檢查
}
```

## 10. ❌ CSRF 保護 (CSRF Protection)

**問題：** 沒有 CSRF 保護，可能受到跨站請求偽造攻擊。

**應該有：**
```typescript
// 檢查 Referer header
const referer = request.headers.get('referer')
if (request.method === 'POST' && !referer?.startsWith(request.nextUrl.origin)) {
  return new NextResponse('Forbidden', { status: 403 })
}
```

## 📊 完整架構建議

### 推薦的 Middleware 架構

```typescript
// middleware.ts
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// 路由配置
const publicRoutes = ['/', '/login', '/test-auth']
const protectedRoutes = ['/admin']
const adminOnlyRoutes = ['/admin/settings', '/admin/users']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. 效能優化：跳過靜態資源
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // 2. 建立 Supabase 客戶端並更新 session
  let supabaseResponse = NextResponse.next({ request })
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
          supabaseResponse = NextResponse.next({ request })
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
    // 如果已登入且訪問登入頁，重導向到 admin
    if (user && pathname === '/login') {
      return NextResponse.redirect(new URL('/admin', request.url))
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

  // 6. 角色權限檢查：只有 admin 可以訪問特定路由
  const isAdminRoute = adminOnlyRoutes.some(route => pathname.startsWith(route))
  if (isAdminRoute && user) {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single()

      if (userData?.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    } catch (error) {
      console.error('[Middleware] Role check error:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 7. API 路由保護
  if (pathname.startsWith('/api') && !user) {
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

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## 🎯 實現優先順序

### 高優先級（必須實現）
1. ✅ **路由保護**：防止未登入用戶訪問 admin 頁面
2. ✅ **錯誤處理**：避免應用崩潰
3. ✅ **效能優化**：跳過公開路由的認證檢查

### 中優先級（建議實現）
4. ✅ **登入後重導向**：改善使用者體驗
5. ✅ **角色權限檢查**：實現 RBAC
6. ✅ **日誌記錄**：方便除錯

### 低優先級（可選實現）
7. ⚪ **API 路由保護**：如果有 API 路由
8. ⚪ **CSRF 保護**：增強安全性
9. ⚪ **Session 刷新**：延長用戶 session

## 📝 總結

您目前的 middleware 只實現了最基本的 session 更新功能，**缺少所有的路由保護和權限檢查邏輯**。這就是為什麼登入後會跳回登入頁的原因——因為沒有任何邏輯阻止未登入用戶訪問 admin 頁面，也沒有邏輯將已登入用戶重導向到正確的頁面。

建議立即實現以下三個核心功能：
1. **路由保護**：未登入用戶無法訪問 `/admin/*`
2. **登入重導向**：已登入用戶訪問 `/login` 時重導向到 `/admin`
3. **錯誤處理**：避免認證錯誤導致應用崩潰

這些功能實現後，您的應用才能正常運作。
