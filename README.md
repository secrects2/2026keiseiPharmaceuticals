# 惠生醫藥集團數位中台系統

基於 Next.js 15 + Supabase 的階層式權限管理系統

## 🎯 系統概述

惠生醫藥集團數位中台系統是一個專為集團與社區雙層級管理設計的數位平台，提供會員管理、產品管理、合作夥伴管理與顧問服務等核心功能，並支援運動幣積分系統。

### 核心特色

- **階層式權限控制**：集團管理員可查看所有社區資料，社區管理者僅能查看所屬社區
- **即時數據統計**：集團戰情室提供即時業務指標與營運概況
- **完整會員管理**：支援搜尋、分頁、統計與詳細資料查看
- **Supabase 整合**：使用 Supabase Auth 進行身份驗證，PostgreSQL 儲存資料
- **現代化 UI**：基於 Tailwind CSS 4 的響應式設計

## 🏗️ 技術架構

### 前端技術棧

- **Next.js 15**：React 框架，支援 App Router 與 Server Components
- **React 19**：最新版本的 React
- **TypeScript**：類型安全的 JavaScript
- **Tailwind CSS 4**：實用優先的 CSS 框架

### 後端技術棧

- **Next.js API Routes**：無伺服器 API 端點
- **Supabase**：後端即服務（BaaS）
  - PostgreSQL 資料庫
  - 身份驗證與授權

## 🚀 快速開始

### 本地開發

```bash
# 安裝依賴
npm install

# 複製環境變數
cp .env.example .env.local

# 編輯 .env.local 填入 Supabase 金鑰

# 啟動開發伺服器
npm run dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

### 測試帳號

- **電子郵件**：`admin@keiseipharm.com`
- **密碼**：`admin`

## 📦 部署到 Vercel

詳細部署步驟請參考 [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

## 📚 功能模組

- ✅ 認證與權限管理
- ✅ 集團戰情室（Dashboard）
- ✅ 會員管理系統
- 🚧 產品管理
- 🚧 合作夥伴管理
- 🚧 顧問服務管理
- ✅ 運動幣積分系統

---

**開發者：** Manus AI Agent  
**最後更新：** 2026-01-13
