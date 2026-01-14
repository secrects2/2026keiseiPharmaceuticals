# 登入問題完整檢查清單

## 📋 問題現象

- 輸入帳號密碼後點擊登入
- 沒有錯誤訊息
- 頁面跳轉後又回到登入頁
- 輸入欄位變成空白

## 🔍 診斷步驟

### 步驟 1：檢查認證狀態

訪問測試頁面：https://2026keisei-pharmaceuticals.vercel.app/test-auth

**檢查項目：**
1. ✅ 環境變數是否正確顯示
   - `NEXT_PUBLIC_SUPABASE_URL` 應該是 `https://eiqrxlfhmnbmmrcswnxi.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 應該顯示「已設定」

2. ❌ 如果環境變數顯示「未設定」
   - **問題：Vercel 環境變數未設定**
   - **解決方案：** 前往 Vercel Dashboard 設定環境變數（見下方）

### 步驟 2：登入後再次檢查

1. 前往登入頁面：https://2026keisei-pharmaceuticals.vercel.app/login
2. 輸入測試帳號：`admin@keiseipharm.com` / `admin`
3. 點擊登入
4. 立即訪問：https://2026keisei-pharmaceuticals.vercel.app/test-auth

**檢查項目：**
1. ✅ 用戶狀態應該顯示用戶資訊
2. ✅ Session 狀態應該顯示 access_token 和 expires_at
3. ✅ Supabase Cookies 應該顯示 `sb-*` 開頭的 cookie

4. ❌ 如果用戶狀態顯示「未登入」
   - **問題：登入失敗或 session 未建立**
   - **可能原因：**
     - Supabase Auth 設定錯誤（Site URL 或 Redirect URLs）
     - 密碼錯誤
     - 環境變數錯誤

5. ❌ 如果沒有 Supabase Cookies
   - **問題：Cookie 未設定**
   - **可能原因：**
     - Supabase Auth 設定的 Site URL 與實際網址不符
     - Cookie domain 設定錯誤

## 🔧 解決方案

### 方案 A：設定 Vercel 環境變數

1. **登入 Vercel Dashboard**
   - 網址：https://vercel.com/dashboard
   - 選擇專案：`2026keisei-pharmaceuticals`

2. **前往 Settings → Environment Variables**

3. **新增環境變數**

   **變數 1：**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://eiqrxlfhmnbmmrcswnxi.supabase.co`
   - Environment: 勾選 Production, Preview, Development（全部）

   **變數 2：**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpcXJ4bGZobW5ibW1yY3N3bnhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDcxMjYsImV4cCI6MjA4MzcyMzEyNn0.igCPyLjuqRhswY2OZooy_dcapBgM0K9mDoJQ6szHYzo`
   - Environment: 勾選 Production, Preview, Development（全部）

4. **儲存後重新部署**
   - Vercel 會自動觸發重新部署
   - 或手動點擊 "Redeploy" 按鈕

### 方案 B：檢查 Supabase Auth 設定

1. **登入 Supabase Dashboard**
   - 網址：https://supabase.com/dashboard
   - 選擇專案：`keiseiPharmaceuticals`

2. **前往 Authentication → URL Configuration**

3. **檢查並修正設定**

   **Site URL：**
   ```
   https://2026keisei-pharmaceuticals.vercel.app
   ```

   **Redirect URLs：**
   ```
   https://2026keisei-pharmaceuticals.vercel.app/**
   ```

4. **儲存設定**

### 方案 C：重設測試用戶密碼

如果懷疑密碼錯誤：

1. **使用 Supabase MCP 重設密碼**

```sql
-- 方法 1：直接更新密碼（需要知道正確的密碼哈希）
-- 不推薦，因為需要正確的 bcrypt 哈希

-- 方法 2：使用 Supabase Dashboard
-- 前往 Authentication → Users
-- 找到 admin@keiseipharm.com
-- 點擊 "Send password reset email"
```

2. **或者建立新的測試用戶**

```sql
-- 使用 Supabase Dashboard 的 SQL Editor
-- 或使用 MCP 的 execute_sql 工具

-- 注意：這只會在 public.users 表建立記錄
-- 還需要在 Supabase Auth 中建立對應的用戶
```

## ✅ 驗證修復

完成上述步驟後：

1. **清除瀏覽器 cookies**
   - Chrome: F12 → Application → Cookies → 刪除所有 `2026keisei-pharmaceuticals.vercel.app` 的 cookies

2. **重新測試登入**
   - 訪問：https://2026keisei-pharmaceuticals.vercel.app/login
   - 輸入：`admin@keiseipharm.com` / `admin`
   - 點擊登入

3. **檢查結果**
   - 應該成功跳轉到 `/admin` 頁面
   - 不會再跳回登入頁

4. **確認認證狀態**
   - 訪問：https://2026keisei-pharmaceuticals.vercel.app/test-auth
   - 應該顯示完整的用戶資訊和 session

## 📊 當前修改

### 已完成的修改

1. ✅ 簡化 middleware，只更新 session 不做重導向
2. ✅ 在 admin layout 中處理認證檢查
3. ✅ 建立 `/test-auth` 測試頁面
4. ✅ 使用 Server Action 處理登入
5. ✅ 修復資料表欄位類型定義

### 待確認的設定

1. ⏳ Vercel 環境變數（需要手動設定）
2. ⏳ Supabase Auth URL Configuration（需要手動檢查）

## 🆘 如果仍然失敗

請提供以下資訊：

1. `/test-auth` 頁面的完整截圖
2. 瀏覽器 Console 的錯誤訊息（F12 → Console）
3. 瀏覽器 Network 標籤的登入請求詳情（F12 → Network → 篩選 "auth"）
4. Vercel 環境變數的截圖（Settings → Environment Variables）
