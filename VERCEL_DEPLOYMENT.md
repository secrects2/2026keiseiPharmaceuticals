# Vercel 部署指南

## 一、前置準備

✅ 已完成：
- Next.js 15 專案已建立
- Supabase 資料庫已配置（包含 1,735 筆資料）
- 代碼已推送到 GitHub：`secrects2/2026keiseiPharmaceuticals`

## 二、Vercel 部署步驟

### 步驟 1：登入 Vercel

1. 前往 [vercel.com](https://vercel.com)
2. 使用 GitHub 帳號登入

### 步驟 2：導入專案

1. 點擊「Add New...」→「Project」
2. 在 Import Git Repository 頁面中，找到 `secrects2/2026keiseiPharmaceuticals`
3. 點擊「Import」

### 步驟 3：配置環境變數

在 Environment Variables 區塊中，新增以下變數：

```
NEXT_PUBLIC_SUPABASE_URL=https://eiqrxlfhmnbmmrcswnxi.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpcXJ4bGZobW5ibW1yY3N3bnhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDcxMjYsImV4cCI6MjA4MzcyMzEyNn0.igCPyLjuqRhswY2OZooy_dcapBgM0K9mDoJQ6szHYzo

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpcXJ4bGZobW5ibW1yY3N3bnhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE0NzEyNiwiZXhwIjoyMDgzNzIzMTI2fQ.GMoGFJ3hYzt0fCaljdx7IV_EQENFGHOx4V7voj9VMOU

DATABASE_URL=postgresql://postgres:zz123793804@db.eiqrxlfhmnbmmrcswnxi.supabase.co:5432/postgres

NEXT_PUBLIC_APP_NAME=惠生醫藥集團數位中台

NEXT_PUBLIC_APP_LOGO=/logo.png
```

**重要：** 請將這些變數套用到 Production、Preview 和 Development 三個環境。

### 步驟 4：部署

1. 確認所有設定正確
2. 點擊「Deploy」按鈕
3. 等待 2-3 分鐘完成建置與部署

### 步驟 5：測試

部署完成後：

1. 點擊 Vercel 提供的網址（例如：`https://2026keiseipharmaceuticals.vercel.app`）
2. 應該會自動重導向到 `/login` 登入頁面
3. 使用測試帳號登入：
   - 電子郵件：`admin@keiseipharm.com`
   - 密碼：`admin`

## 三、Supabase 認證設定

### 重要：設定 Redirect URLs

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的專案：`eiqrxlfhmnbmmrcswnxi`
3. 進入 **Authentication** → **URL Configuration**
4. 在 **Redirect URLs** 中新增：
   ```
   https://2026keiseipharmaceuticals.vercel.app/auth/callback
   https://2026keiseipharmaceuticals.vercel.app/**
   ```
5. 在 **Site URL** 設定為：
   ```
   https://2026keiseipharmaceuticals.vercel.app
   ```
6. 點擊「Save」

### 建立測試用戶

如果資料庫中沒有測試用戶，請執行以下 SQL：

```sql
-- 建立測試管理員帳號
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@keiseipharm.com',
  crypt('admin', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- 建立對應的 users 表記錄
INSERT INTO users (
  id,
  email,
  name,
  role,
  community_id,
  created_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@keiseipharm.com'),
  'admin@keiseipharm.com',
  '系統管理員',
  'admin',
  NULL,
  now()
);
```

## 四、自訂網域（選填）

如果您想使用自訂網域：

1. 在 Vercel 專案設定中，進入 **Domains** 標籤
2. 點擊「Add」輸入您的網域名稱
3. 依照 Vercel 的指示，在您的 DNS 提供商設定 CNAME 或 A 記錄
4. 等待 DNS 傳播完成（通常需要 10-60 分鐘）

## 五、常見問題排除

### 問題 1：登入後出現 404 錯誤

**原因：** Supabase Redirect URLs 未正確設定

**解決方法：** 確認 Supabase Dashboard 中的 Redirect URLs 包含您的 Vercel 網址

### 問題 2：無法載入會員資料

**原因：** 資料庫連線失敗或權限不足

**解決方法：**
1. 檢查 `DATABASE_URL` 環境變數是否正確
2. 確認 Supabase 資料庫中有資料（應有 1,735 筆）
3. 檢查 Supabase 的 RLS (Row Level Security) 政策

### 問題 3：部署失敗

**原因：** 環境變數未設定或 Node.js 版本不相容

**解決方法：**
1. 確認所有環境變數都已正確設定
2. 在 Vercel 專案設定中，確認 Node.js 版本為 22.x

## 六、後續開發

### 本地開發

```bash
# Clone 專案
git clone https://github.com/secrects2/2026keiseiPharmaceuticals.git
cd 2026keiseiPharmaceuticals

# 安裝依賴
npm install

# 複製環境變數
cp .env.example .env.local
# 編輯 .env.local 填入 Supabase 金鑰

# 啟動開發伺服器
npm run dev
```

### 推送更新

```bash
# 修改代碼後
git add .
git commit -m "更新說明"
git push origin main
```

Vercel 會自動偵測 GitHub 推送並重新部署。

---

**部署完成！** 🎉

您的惠生醫藥集團數位中台系統現已成功部署到 Vercel。

如有任何問題，請參考：
- [Next.js 文檔](https://nextjs.org/docs)
- [Supabase 文檔](https://supabase.com/docs)
- [Vercel 文檔](https://vercel.com/docs)
