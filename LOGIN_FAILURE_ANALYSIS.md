# 登入失敗深入分析報告

## 問題現象

1. 輸入帳號密碼後點擊登入
2. 沒有錯誤訊息顯示
3. 頁面跳轉後又回到登入頁
4. 輸入欄位變成空白

## 根本原因分析

### 問題 1：Cookie Domain 不匹配

**Supabase 客戶端設定的 cookie domain 可能與 Vercel 部署網址不匹配**

- Vercel 網址：`2026keisei-pharmaceuticals.vercel.app`
- Supabase 可能設定的 cookie domain：可能是其他值

**檢查方法：**
在瀏覽器開發者工具 → Application → Cookies 中查看：
- 是否有 `sb-*` 開頭的 cookie
- cookie 的 domain 是否正確

### 問題 2：Supabase Auth 設定錯誤

**Supabase Dashboard 中的 Site URL 和 Redirect URLs 可能未正確設定**

必須設定：
- Site URL: `https://2026keisei-pharmaceuticals.vercel.app`
- Redirect URLs: `https://2026keisei-pharmaceuticals.vercel.app/**`

### 問題 3：客戶端與伺服器端 Supabase 客戶端不一致

**問題：**
- 客戶端使用 `@supabase/supabase-js` 的 `createClient`
- 伺服器端使用 `@supabase/ssr` 的 `createServerClient`
- 兩者的 cookie 處理機制不同

**解決方案：**
改用 Server Action 處理登入，確保使用相同的 SSR 客戶端。

### 問題 4：Middleware 執行時機問題

**問題：**
- 客戶端登入後設定 cookie
- 使用 `window.location.href` 跳轉
- 但 middleware 可能在 cookie 尚未完全寫入時就執行

## 推薦解決方案

### 方案 A：使用 Server Action（推薦）

```typescript
// app/login/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/admin')
}
```

**優點：**
- 使用伺服器端 Supabase 客戶端
- Cookie 由伺服器端直接設定
- 與 middleware 使用相同的認證機制

### 方案 B：檢查 Supabase Auth 設定

1. 登入 Supabase Dashboard
2. 前往 Authentication → URL Configuration
3. 確認：
   - Site URL: `https://2026keisei-pharmaceuticals.vercel.app`
   - Redirect URLs 包含: `https://2026keisei-pharmaceuticals.vercel.app/**`

### 方案 C：簡化 Middleware（臨時方案）

暫時移除 middleware 的認證檢查，改在 admin layout 中檢查：

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // 暫時只更新 session，不做重導向
  return await updateSession(request)
}
```

```typescript
// app/admin/layout.tsx
export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // ... rest of layout
}
```

## 下一步行動

1. **優先嘗試方案 A**：改用 Server Action
2. **檢查 Supabase 設定**：確認 URL Configuration
3. **如果仍失敗**：使用瀏覽器開發者工具檢查 cookie 是否正確設定

## 測試步驟

1. 清除瀏覽器所有 cookie
2. 重新訪問登入頁面
3. 輸入測試帳號密碼
4. 打開開發者工具 → Network 標籤
5. 點擊登入，觀察：
   - 是否有 API 請求到 Supabase
   - Response 是否包含 session
   - Cookie 是否被設定
6. 檢查 Application → Cookies 是否有 `sb-*` cookie
