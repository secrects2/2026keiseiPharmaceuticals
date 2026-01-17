# 資料庫結構分析

## 現有資料表

### 1. 用戶相關
- **users** - 平台用戶（會員、老師、店家、管理員）
  - role: enum (user, admin, teacher, store)
  
- **teachers** - 授課老師資料
  - user_id (關聯 users)
  - 專長、經歷等

### 2. 店家相關
- **partner_merchants** - 合作店家
  - 店家名稱、聯絡人、地址
  - 合作狀態、佣金比例
  - ❌ **缺少：年費資訊、合約期限**

- **sports_products** - 運動用品商品
  - merchant_id (關聯 partner_merchants)
  - 商品資訊、價格、庫存

- **sports_sales** - 銷售記錄
  - merchant_id (關聯 partner_merchants)
  - 訂單資訊、金額、狀態

- **sports_inventory** - 庫存管理
  - product_id (關聯 sports_products)
  - 庫存數量、倉庫位置

### 3. 店家活動相關
- **store_events** - 店家活動
  - merchant_id (關聯 partner_merchants)
  - 活動資訊、時間、地點

- **store_event_registrations** - 活動報名
  - event_id (關聯 store_events)
  - user_id (關聯 users)
  - 報到狀態、QR Code

- **store_schedules** - 店家課程表
  - merchant_id (關聯 partner_merchants)
  - 課程資訊、時間、講師

### 4. 課程相關
- **courses** - 授課老師的課程
  - teacher_id (關聯 teachers)
  - 課程資訊、價格、狀態
  - ❌ **缺少：收益分潤資訊**

### 5. 系統相關
- **events** - 系統事件記錄（用戶行為追蹤）
- **notifications** - 通知記錄

---

## 集團管理員需要的功能與資料表

### 需要新增的表

#### 1. **merchant_fees** - 店家年費管理
```sql
- id (主鍵)
- merchant_id (關聯 partner_merchants)
- fee_year (年度，例如：2026)
- annual_fee (年費金額)
- payment_status (付款狀態：pending, paid, overdue)
- payment_date (付款日期)
- contract_start_date (合約開始日期)
- contract_end_date (合約結束日期)
- notes (備註)
- created_at
- updated_at
```

#### 2. **revenue_sharing** - 分潤記錄
```sql
- id (主鍵)
- entity_type (類型：teacher, merchant)
- entity_id (關聯 teachers.id 或 partner_merchants.id)
- revenue_source (來源：course_sale, product_sale, event)
- source_id (來源 ID：course_id, sale_id, event_id)
- total_amount (總金額)
- platform_share (平台分潤)
- entity_share (老師/店家分潤)
- share_percentage (分潤比例 %)
- status (狀態：pending, paid)
- settlement_date (結算日期)
- created_at
```

#### 3. **supply_products** - 供應產品目錄（集團提供給店家的商品）
```sql
- id (主鍵)
- product_name (商品名稱)
- product_code (商品編號)
- category (分類)
- brand (品牌)
- supply_price (供貨價)
- suggested_retail_price (建議零售價)
- description (描述)
- is_active (是否供應中)
- created_at
- updated_at
```

#### 4. **merchant_supply_orders** - 店家進貨訂單
```sql
- id (主鍵)
- merchant_id (關聯 partner_merchants)
- order_number (訂單號)
- order_date (訂單日期)
- total_amount (總金額)
- payment_status (付款狀態)
- delivery_status (配送狀態)
- notes (備註)
- created_at
- updated_at
```

#### 5. **merchant_supply_order_items** - 進貨訂單明細
```sql
- id (主鍵)
- order_id (關聯 merchant_supply_orders)
- supply_product_id (關聯 supply_products)
- quantity (數量)
- unit_price (單價)
- subtotal (小計)
```

### 需要修改的表

#### 1. **partner_merchants** - 新增欄位
```sql
ALTER TABLE partner_merchants ADD COLUMN:
- annual_fee_amount (年費金額，預設值)
- contract_start_date (合約開始日期)
- contract_end_date (合約結束日期)
- fee_payment_status (年費付款狀態)
```

#### 2. **courses** - 新增欄位
```sql
ALTER TABLE courses ADD COLUMN:
- revenue_share_percentage (老師分潤比例 %，預設 70%)
- platform_share_percentage (平台分潤比例 %，預設 30%)
```

#### 3. **teachers** - 新增欄位
```sql
ALTER TABLE teachers ADD COLUMN:
- default_revenue_share (預設分潤比例 %，可個別設定)
- bank_account (銀行帳戶資訊，用於分潤匯款)
```

---

## 集團管理員功能模組

### 1. 合作店家管理
- 店家列表（所有合作店家）
- 新增/編輯店家
- 年費管理（查看、催繳、記錄付款）
- 合約管理（合約期限、續約提醒）
- 店家營運數據（營收、訂單數、會員數）

### 2. 授課老師管理
- 老師列表（所有授課老師）
- 審核老師申請
- 課程審核（待審核課程列表）
- 收益分潤管理（查看、結算、匯款記錄）
- 老師表現數據（課程數、學員數、營收）

### 3. 供應產品管理
- 產品目錄（集團提供的商品）
- 新增/編輯供應商品
- 價格管理（供貨價、建議零售價）
- 庫存管理（總庫存、各店家庫存）

### 4. 進貨訂單管理
- 店家進貨訂單列表
- 訂單處理（審核、出貨、對帳）
- 進貨統計（各店家進貨金額、頻率）

### 5. 分潤管理
- 分潤總覽（待結算金額）
- 老師分潤（課程收益分潤）
- 店家分潤（商品銷售佣金）
- 結算記錄（已結算的分潤記錄）

### 6. 全平台數據分析
- 總營收統計（課程 + 商品 + 年費）
- 各店家表現排行
- 各老師表現排行
- 會員成長趨勢
- 活動參與統計

---

## 建議實作順序

1. **資料表建立/修改**（優先）
   - 建立新表：merchant_fees, revenue_sharing, supply_products
   - 修改現有表：partner_merchants, courses, teachers

2. **核心功能**
   - 合作店家管理（含年費管理）
   - 授課老師管理（含分潤管理）

3. **進階功能**
   - 供應產品管理
   - 進貨訂單管理
   - 全平台數據分析
