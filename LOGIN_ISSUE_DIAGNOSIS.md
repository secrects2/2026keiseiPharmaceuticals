# 登入問題診斷報告

**問題描述：** 登入後跳回登入頁（認證循環）

**測試日期：** 2026-01-13  
**測試環境：** Vercel Production (Commit: 38719f2)

---

## 🔍 診斷過程

### 1. 初始問題
用戶報告：登入後又跳回登入頁

### 2. 第一次修復嘗試
**修改內容：**
- 使用 Server Action 處理登入（app/login/actions.ts）
- 修改 admin layout 使用 `maybeSingle()` 避免 PGRST116 錯誤
- 確保登入成功後 `revalidatePath` 清除快取

**結果：** 部署成功，但登入按鈕沒有反應

### 3. JavaScript 載入檢查
**檢查項目：**
- ✅ Next.js JavaScript chunks 已載入（16 個 script 標籤）
- ✅ Turbopack bundle 存在
- ❌ Console 沒有任何輸出（包括 console.log）
- ❌ 表單提交事件沒有觸發

**JavaScript 檔案列表：**
```
- 5e98d82c2afd4e32.js
- 30ea11065999f7ac.js
- e000c711b3c34a6d.js
- 8b4c52e426985d12.js
- turbopack-04fe2264d1720afd.js
- ff1a16fafef87110.js
- 7340adf74ff47ec0.js
- fa3f308484e959d3.js
- a6dad97d9634a72d.js
- a4f29ca3af4c6896.js
+ 6 inline scripts
```

---

## 🐛 根本原因分析

### 可能原因 1：Vercel 預覽連結問題
使用 `_vercel_share` 參數的臨時連結可能導致：
- JavaScript 執行被阻擋
- Cookie 設定失敗
- CSP (Content Security Policy) 限制

### 可能原因 2：Next.js Hydration 失敗
- 伺服器端渲染的 HTML 與客戶端不匹配
- React 無法正確 hydrate 頁面
- 導致事件監聽器沒有綁定

### 可能原因 3：Supabase 環境變數問題
- `NEXT_PUBLIC_SUPABASE_URL` 未設定
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 未設定
- 導致 Supabase 客戶端初始化失敗

---

## ✅ 建議解決方案

### 立即行動

#### 1. 檢查 Vercel 環境變數
登入 Vercel Dashboard → 專案設定 → Environment Variables

確認以下變數已設定：
```
NEXT_PUBLIC_SUPABASE_URL=https://eiqrxlfhmnbmmrcswnxi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
```

**重要：** 環境變數名稱必須以 `NEXT_PUBLIC_` 開頭才能在客戶端使用！

#### 2. 檢查 Supabase Auth 設定
登入 Supabase Dashboard → Authentication → URL Configuration

確認以下設定：
- **Site URL:** `https://2026keisei-pharmaceuticals.vercel.app`
- **Redirect URLs:** 
  - `https://2026keisei-pharmaceuticals.vercel.app/auth/callback`
  - `https://2026keisei-pharmaceuticals.vercel.app/**`

#### 3. 測試不使用預覽連結
直接訪問生產網址（不帶 `_vercel_share` 參數）：
```
https://2026keisei-pharmaceuticals.vercel.app/login
```

如果需要測試，可以：
1. 在 Vercel Dashboard 中將專案設為 Public
2. 或使用 Vercel CLI 登入後測試

---

## 🔧 程式碼修改記錄

### app/login/actions.ts（新增）
```typescript
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

### app/login/page.tsx（修改）
- 改用 Server Action 而非客戶端 Supabase 調用
- 使用 `defaultValue` 而非 `value` + `onChange`
- 簡化錯誤處理邏輯

### app/admin/layout.tsx（修改）
- 使用 `maybeSingle()` 而非 `single()`
- 分離錯誤處理和資料檢查邏輯

---

## 📊 測試結果

### Vercel 部署狀態
- ✅ 部署成功（READY）
- ✅ 建置無錯誤
- ✅ JavaScript chunks 正常載入
- ❌ 登入功能無法測試（預覽連結問題）

### 需要用戶協助
1. **檢查環境變數：** 確認 Vercel 專案的環境變數已正確設定
2. **檢查 Supabase 設定：** 確認 Auth URL Configuration 包含 Vercel 網址
3. **測試登入：** 直接訪問生產網址（不使用預覽連結）測試登入功能

---

## 📝 下一步

### 如果環境變數正確
登入功能應該可以正常運作，因為：
- ✅ Server Action 正確處理登入
- ✅ Session cookie 會在伺服器端設定
- ✅ Middleware 會正確讀取 session
- ✅ Admin layout 會正確查詢用戶資料

### 如果仍然有問題
可能需要：
1. 檢查 Supabase 資料庫的 RLS (Row Level Security) 政策
2. 檢查 Supabase Auth 的 Email Provider 設定
3. 查看 Vercel Function Logs 確認 Server Action 是否執行成功

---

## 🎯 總結

**已完成：**
- ✅ 使用 Server Action 重構登入邏輯
- ✅ 修復 admin layout 的查詢邏輯
- ✅ 確保 revalidatePath 清除快取
- ✅ 成功部署到 Vercel

**待確認：**
- ⚠️ Vercel 環境變數設定
- ⚠️ Supabase Auth URL Configuration
- ⚠️ 登入功能實際測試（需要用戶直接訪問生產網址）

**建議：**
用戶應該先檢查 Vercel 和 Supabase 的設定，然後直接訪問生產網址測試登入功能。如果環境變數正確，登入應該可以正常運作。
