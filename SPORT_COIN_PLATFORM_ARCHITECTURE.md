# 惠生醫藥運動幣平台系統架構

## 🎯 平台定位

**惠生醫藥集團運動幣生態平台**
- 政府運動幣合作店家
- 運動產品供應商（添裝備類）
- 運動課程平台（做運動類）
- 線上教育認證系統

---

## 👥 三種角色定位

### 1. 平台管理者（惠生醫藥）
**權限**：最高管理權限
**功能**：
- 審核課程上架申請
- 管理商品庫存
- 核銷政府運動幣
- 查看平台營收報表
- 管理老師帳號
- 管理會員帳號
- 設定分潤比例
- 產生政府核銷報表（日報、週報）

### 2. 課程老師（供應商）
**權限**：課程管理權限
**功能**：
- 上架課程（實體/線上）
- 設定課程價格
- 管理課程內容（影片、教材）
- 查看學員名單
- 查看課程評價
- 查看收益報表
- 頒發證書給學員
- 接收學員提問

### 3. 會員（消費者）
**權限**：一般使用者權限
**功能**：
- 登記抽政府運動幣
- 查看運動幣餘額（政府幣/自有幣）
- 購買運動產品（用運動幣抵用）
- 報名運動課程（用運動幣抵用）
- 觀看線上課程
- 下載證書
- 查看購買/報名記錄
- 評價課程

---

## 📊 資料庫架構

### 新增/調整的資料表

#### 1. `users` 表（調整）
```sql
-- 新增角色類型
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'member';
-- 'admin' = 平台管理者
-- 'teacher' = 課程老師
-- 'member' = 一般會員
```

#### 2. `teachers` 表（新建）
```sql
CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  teacher_name VARCHAR(200),
  bio TEXT,
  specialties TEXT[], -- 專長領域
  qualifications TEXT[], -- 資格證照
  avatar_url TEXT,
  bank_account VARCHAR(50),
  bank_code VARCHAR(10),
  revenue_share_percentage DECIMAL(5,2) DEFAULT 70.00, -- 分潤比例（預設 70%）
  total_revenue DECIMAL(10,2) DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  approval_status VARCHAR(50) DEFAULT 'pending', -- 'pending' / 'approved' / 'rejected'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. `courses` 表（新建）
```sql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER REFERENCES teachers(id),
  course_name VARCHAR(200),
  course_description TEXT,
  course_type VARCHAR(50), -- 'online' / 'offline' / 'hybrid'
  course_category VARCHAR(50), -- 'exercise' (做運動) / 'watch_game' (看比賽)
  cover_image_url TEXT,
  price DECIMAL(10,2),
  government_coin_applicable BOOLEAN DEFAULT true, -- 是否接受政府運動幣
  max_government_coin_amount DECIMAL(10,2), -- 最高可用政府運動幣金額
  duration_hours INTEGER, -- 課程時數
  max_students INTEGER, -- 最大學員數
  current_students INTEGER DEFAULT 0,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  location TEXT, -- 實體課程地點
  video_url TEXT, -- 線上課程影片連結
  materials_url TEXT, -- 教材下載連結
  certificate_template_url TEXT, -- 證書模板
  approval_status VARCHAR(50) DEFAULT 'pending', -- 'pending' / 'approved' / 'rejected'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. `course_enrollments` 表（新建）
```sql
CREATE TABLE course_enrollments (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id),
  user_id INTEGER REFERENCES users(id),
  enrollment_date TIMESTAMP DEFAULT NOW(),
  payment_amount DECIMAL(10,2),
  government_coin_used DECIMAL(10,2) DEFAULT 0,
  self_coin_used DECIMAL(10,2) DEFAULT 0,
  payment_status VARCHAR(50) DEFAULT 'completed', -- 'pending' / 'completed' / 'refunded'
  completion_status VARCHAR(50) DEFAULT 'enrolled', -- 'enrolled' / 'in_progress' / 'completed' / 'dropped'
  completion_date TIMESTAMP,
  certificate_issued BOOLEAN DEFAULT false,
  certificate_url TEXT,
  rating INTEGER, -- 1-5 星評分
  review TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. `certificates` 表（新建）
```sql
CREATE TABLE certificates (
  id SERIAL PRIMARY KEY,
  enrollment_id INTEGER REFERENCES course_enrollments(id),
  user_id INTEGER REFERENCES users(id),
  course_id INTEGER REFERENCES courses(id),
  certificate_number VARCHAR(100) UNIQUE, -- 證書編號
  issue_date TIMESTAMP DEFAULT NOW(),
  certificate_url TEXT, -- 證書 PDF 連結
  verification_code VARCHAR(50), -- 驗證碼
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. `sport_coins` 表（調整）
```sql
ALTER TABLE sport_coins ADD COLUMN IF NOT EXISTS coin_type VARCHAR(50) DEFAULT 'self';
-- 'government' = 政府運動幣
-- 'self' = 自有運動幣

ALTER TABLE sport_coins ADD COLUMN IF NOT EXISTS government_coin_id VARCHAR(100);
-- 政府運動幣 ID（若有提供）

ALTER TABLE sport_coins ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP;
-- 有效期限（政府運動幣：2026/12/31）

ALTER TABLE sport_coins ADD COLUMN IF NOT EXISTS usage_category VARCHAR(50);
-- 'exercise' (做運動 - 可用 500)
-- 'watch_game' (看比賽 - 可用 500)
-- 'equipment' (添裝備 - 可用 200)
```

#### 7. `coin_transactions` 表（新建）
```sql
CREATE TABLE coin_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  transaction_type VARCHAR(50), -- 'receive' / 'use' / 'refund'
  coin_type VARCHAR(50), -- 'government' / 'self'
  amount DECIMAL(10,2),
  related_type VARCHAR(50), -- 'product' / 'course'
  related_id INTEGER, -- product_id or course_id
  transaction_date TIMESTAMP DEFAULT NOW(),
  settlement_status VARCHAR(50) DEFAULT 'pending', -- 'pending' / 'settled' / 'paid'
  settlement_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 8. `sports_products` 表（調整）
```sql
ALTER TABLE sports_products ADD COLUMN IF NOT EXISTS product_category VARCHAR(50) DEFAULT 'equipment';
-- 'equipment' (添裝備)
-- 'exercise' (做運動 - 如運動器材組合)

ALTER TABLE sports_products ADD COLUMN IF NOT EXISTS government_coin_applicable BOOLEAN DEFAULT true;
-- 是否接受政府運動幣

ALTER TABLE sports_products ADD COLUMN IF NOT EXISTS max_government_coin_amount DECIMAL(10,2) DEFAULT 200.00;
-- 最高可用政府運動幣金額（添裝備類預設 200）
```

#### 9. `revenue_reports` 表（新建）
```sql
CREATE TABLE revenue_reports (
  id SERIAL PRIMARY KEY,
  report_type VARCHAR(50), -- 'daily' / 'weekly' / 'monthly'
  report_date DATE,
  total_government_coin_used DECIMAL(10,2) DEFAULT 0,
  total_self_coin_used DECIMAL(10,2) DEFAULT 0,
  total_product_revenue DECIMAL(10,2) DEFAULT 0,
  total_course_revenue DECIMAL(10,2) DEFAULT 0,
  total_teacher_payout DECIMAL(10,2) DEFAULT 0,
  settlement_status VARCHAR(50) DEFAULT 'pending', -- 'pending' / 'submitted' / 'paid'
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 核心業務流程

### 1. 老師上架課程流程
```
老師註冊 → 填寫資料 → 平台審核 → 通過後可上架課程
→ 填寫課程資訊 → 上傳教材/影片 → 設定價格
→ 提交審核 → 平台審核通過 → 課程上架
```

### 2. 會員購買課程流程
```
會員登入 → 瀏覽課程 → 選擇課程 → 確認價格
→ 選擇付款方式（政府運動幣 + 自有運動幣）
→ 檢查運動幣餘額和使用限制 → 完成報名
→ 開始上課 → 完成課程 → 獲得證書
```

### 3. 政府運動幣核銷流程
```
會員使用政府運動幣 → 記錄交易明細
→ 每日產生核銷報表 → 每週結算
→ 提交政府動滋網 → 政府撥款 → 分潤給老師
```

### 4. 證書頒發流程
```
會員完成課程 → 老師確認完成 → 系統產生證書
→ 分配證書編號 → 產生 PDF → 發送通知
→ 會員下載證書 → 可驗證真偽
```

---

## 📱 功能頁面架構

### 會員端（Member）
```
/member
  /dashboard - 會員儀表板
  /coins - 運動幣管理
    /government - 政府運動幣（餘額、有效期限、使用記錄）
    /self - 自有運動幣（餘額、獲得方式、使用記錄）
  /courses - 課程中心
    /browse - 瀏覽課程
    /my-courses - 我的課程
    /certificates - 我的證書
  /shop - 商品中心
    /browse - 瀏覽商品
    /cart - 購物車
  /orders - 訂單記錄
  /profile - 個人資料
```

### 老師端（Teacher）
```
/teacher
  /dashboard - 老師儀表板
  /courses - 課程管理
    /create - 建立課程
    /list - 我的課程
    /edit/:id - 編輯課程
  /students - 學員管理
  /revenue - 收益報表
  /certificates - 證書管理
  /profile - 老師資料
```

### 管理者端（Admin）
```
/admin
  /dashboard - 管理儀表板
  /teachers - 老師管理
    /list - 老師列表
    /approve - 審核申請
  /courses - 課程管理
    /list - 課程列表
    /approve - 審核課程
  /products - 商品管理
  /members - 會員管理
  /coins - 運動幣管理
    /distribute - 發放運動幣
    /transactions - 交易記錄
  /settlement - 核銷管理
    /daily - 日報表
    /weekly - 週報表
    /government - 政府核銷
  /revenue - 營收報表
```

---

## 🎨 UI/UX 設計方向

### 會員端
- **風格**：清新、活力、運動感
- **主色調**：Indigo (靛藍) + Orange (橘色)
- **重點**：簡潔易用、快速找到課程/商品

### 老師端
- **風格**：專業、簡約、高效
- **主色調**：Indigo (靛藍) + Green (綠色)
- **重點**：數據可視化、快速管理

### 管理者端
- **風格**：專業、數據導向
- **主色調**：Indigo (靛藍) + Purple (紫色)
- **重點**：報表清晰、審核高效

---

## 🚀 開發優先順序

### Phase 1: 資料庫建立（本週）
- [ ] 建立 teachers 表
- [ ] 建立 courses 表
- [ ] 建立 course_enrollments 表
- [ ] 建立 certificates 表
- [ ] 調整 sport_coins 表
- [ ] 建立 coin_transactions 表
- [ ] 調整 sports_products 表
- [ ] 建立 revenue_reports 表

### Phase 2: 會員端改寫（下週）
- [ ] 改寫運動幣頁面（區分政府幣/自有幣）
- [ ] 改寫課程瀏覽頁面
- [ ] 建立課程詳情頁面
- [ ] 建立課程報名流程
- [ ] 建立我的課程頁面
- [ ] 建立證書頁面

### Phase 3: 老師端開發（下下週）
- [ ] 建立老師註冊流程
- [ ] 建立老師儀表板
- [ ] 建立課程建立頁面
- [ ] 建立課程管理頁面
- [ ] 建立學員管理頁面
- [ ] 建立收益報表頁面

### Phase 4: 管理者端開發（第四週）
- [ ] 建立管理儀表板
- [ ] 建立老師審核頁面
- [ ] 建立課程審核頁面
- [ ] 建立運動幣發放頁面
- [ ] 建立核銷管理頁面
- [ ] 建立營收報表頁面

---

## 💰 分潤機制

### 課程收益分配
- **老師**：70%（可調整）
- **平台**：30%

### 商品收益分配
- **平台**：100%（自營商品）

### 政府運動幣核銷
- 政府撥款 → 平台 → 按比例分潤給老師

---

**文件建立時間**：2026-01-15  
**最後更新時間**：2026-01-15  
**負責人**：Manus AI  
**狀態**：規劃中
