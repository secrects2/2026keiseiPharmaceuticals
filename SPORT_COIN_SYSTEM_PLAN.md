# 運動幣系統規劃文件

## 📋 政策背景

### 運動幣政策重點
- **發放對象**：年滿 16 歲以上國民（民國 99 年 1 月 1 日以前出生）
- **發放數量**：60 萬份，每份 500 元
- **登記時間**：2026/1/26 - 2/8（共 14 日）
- **使用期限**：2026/3/1 - 12/31
- **總預算**：3 億元（第一季）

### 抵用類別
1. **做運動**：可全額 500 元抵用（運動課程、場館）
2. **看比賽**：可全額 500 元抵用（運動賽事門票）
3. **添裝備**：最高 200 元抵用（運動用品、器材、鞋服、穿戴裝置）

### 合作店家申請
- **申請時間**：2026/1/5 起開放
- **申請網站**：https://500.gov.tw/
- **核銷原則**：日日對帳、週週結算、速速撥款

---

## 🎯 系統對標策略

### 現有系統功能
1. ✅ 會員管理系統（users, member_profiles）
2. ✅ 運動幣管理（sport_coins）
3. ✅ 活動報名（events, event_registrations）
4. ✅ 商品兌換（sports_products, redemptions）
5. ✅ 購買記錄（member_purchases）
6. ✅ 通知系統（notifications）

### 需要調整的功能

#### 1. 運動幣系統升級
**現況**：
- 已有 `sport_coins` 表，但功能較簡單
- 只記錄餘額和交易記錄

**調整方向**：
- 新增「政府運動幣」類型（區分自有運動幣 vs 政府運動幣）
- 記錄運動幣來源（政府發放 / 活動獲得 / 購買）
- 記錄使用限制（添裝備最高 200 元）
- 記錄有效期限（2026/12/31）

#### 2. 商品分類系統
**現況**：
- `sports_products` 表有基本商品資訊

**調整方向**：
- 新增商品類別欄位：`做運動` / `看比賽` / `添裝備`
- 標記哪些商品可用政府運動幣抵用
- 設定抵用上限（添裝備類最高 200 元）

#### 3. 核銷管理系統
**新增需求**：
- 記錄每筆運動幣使用明細
- 產生核銷報表（日報、週報）
- 對接政府動滋網 API（若有提供）
- 追蹤撥款狀態

#### 4. 合作店家資訊
**新增需求**：
- 記錄營業登記資訊（統一編號、設立日期、登記地址）
- 上傳營業登記證明、存摺封面、LOGO、門店照片
- 選擇主要抵用類別
- 追蹤審核狀態

---

## 📊 資料庫調整方案

### 1. 調整 `sport_coins` 表
```sql
ALTER TABLE sport_coins ADD COLUMN IF NOT EXISTS coin_source VARCHAR(50); -- 'government' / 'activity' / 'purchase'
ALTER TABLE sport_coins ADD COLUMN IF NOT EXISTS government_coin_id VARCHAR(100); -- 政府運動幣 ID
ALTER TABLE sport_coins ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP; -- 有效期限
ALTER TABLE sport_coins ADD COLUMN IF NOT EXISTS usage_limit DECIMAL(10,2); -- 使用上限（添裝備 200 元）
```

### 2. 調整 `sports_products` 表
```sql
ALTER TABLE sports_products ADD COLUMN IF NOT EXISTS product_category VARCHAR(50); -- 'exercise' / 'watch_game' / 'equipment'
ALTER TABLE sports_products ADD COLUMN IF NOT EXISTS accept_government_coin BOOLEAN DEFAULT false; -- 是否接受政府運動幣
ALTER TABLE sports_products ADD COLUMN IF NOT EXISTS government_coin_limit DECIMAL(10,2); -- 政府運動幣抵用上限
```

### 3. 新增 `coin_transactions` 表（核銷記錄）
```sql
CREATE TABLE coin_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  transaction_type VARCHAR(50), -- 'receive' / 'use' / 'refund'
  coin_source VARCHAR(50), -- 'government' / 'self'
  amount DECIMAL(10,2),
  product_id INTEGER REFERENCES sports_products(id),
  product_category VARCHAR(50),
  transaction_date TIMESTAMP DEFAULT NOW(),
  settlement_status VARCHAR(50), -- 'pending' / 'settled' / 'paid'
  settlement_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. 新增 `partner_stores` 表（合作店家資訊）
```sql
CREATE TABLE partner_stores (
  id SERIAL PRIMARY KEY,
  store_name VARCHAR(200),
  business_registration_name VARCHAR(200),
  unified_number VARCHAR(20),
  establishment_date DATE,
  registration_address TEXT,
  business_address TEXT,
  business_hours VARCHAR(200),
  business_phone VARCHAR(50),
  owner_name VARCHAR(100),
  contact_person VARCHAR(100),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(200),
  main_category VARCHAR(50), -- 'exercise' / 'watch_game' / 'equipment'
  registration_doc_url TEXT,
  bank_account_doc_url TEXT,
  logo_url TEXT,
  store_photo_url TEXT,
  product_photo_url TEXT,
  approval_status VARCHAR(50), -- 'pending' / 'approved' / 'rejected'
  approval_date TIMESTAMP,
  approval_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 功能實作優先順序

### Phase 1: 資料庫調整（立即執行）
- [ ] 調整 `sport_coins` 表結構
- [ ] 調整 `sports_products` 表結構
- [ ] 建立 `coin_transactions` 表
- [ ] 建立 `partner_stores` 表

### Phase 2: 核心功能實作
- [ ] 政府運動幣發放功能（管理員手動發放 / 批次匯入）
- [ ] 運動幣抵用功能（區分政府幣 vs 自有幣）
- [ ] 抵用限制檢查（添裝備最高 200 元）
- [ ] 有效期限檢查（2026/12/31）

### Phase 3: 核銷管理
- [ ] 核銷記錄查詢
- [ ] 日報表產生（每日核銷金額）
- [ ] 週報表產生（每週結算金額）
- [ ] 撥款狀態追蹤

### Phase 4: 合作店家管理
- [ ] 店家資訊管理頁面
- [ ] 營業登記資料上傳
- [ ] 審核狀態追蹤
- [ ] 店家資訊展示（前台）

### Phase 5: 會員推廣功能
- [ ] 運動幣抽籤提醒（推播通知）
- [ ] 中籤通知
- [ ] 運動幣使用指南
- [ ] 推薦商品（可用運動幣）

---

## 💡 商業策略建議

### 1. 短期策略（Q1 2026）
- **目標**：搶佔第一波 3 億元市場
- **行動**：
  1. 立即申請成為合作店家（1/5 起）
  2. 推廣會員登記抽籤（1/26-2/8）
  3. 準備「添裝備」類商品（護具、彈力帶、握力球等）
  4. 包裝運動課程（若要收滿 500 元）

### 2. 中期策略（Q2-Q4 2026）
- **目標**：建立運動幣生態系統
- **行動**：
  1. 擴充運動器材品項
  2. 開發運動課程（需營業登記 J802010 運動訓練業）
  3. 與其他合作店家策略聯盟
  4. 優化核銷流程（日日對帳、週週結算）

### 3. 長期策略（2027+）
- **目標**：成為運動幣生態圈核心店家
- **行動**：
  1. 建立品牌知名度
  2. 開發自有運動幣系統（與政府運動幣並行）
  3. 整合 LINE OA / Omnichat 推播
  4. 數據分析優化商品組合

---

## 📝 下一步行動

### 立即執行（本週）
1. ✅ 完成系統規劃文件
2. ⏳ 調整資料庫結構
3. ⏳ 實作政府運動幣發放功能
4. ⏳ 實作運動幣抵用功能

### 近期執行（下週）
1. ⏳ 實作核銷管理功能
2. ⏳ 實作合作店家資訊管理
3. ⏳ 整合通知系統（推廣抽籤）

### 同步進行（外部）
1. ⏳ 申請成為合作店家（https://500.gov.tw/）
2. ⏳ 準備營業登記證明文件
3. ⏳ 評估是否新增營業項目（J802010 運動訓練業）
4. ⏳ 準備商品清單（添裝備類）

---

**文件建立時間**：2026-01-15  
**最後更新時間**：2026-01-15  
**負責人**：Manus AI  
**狀態**：規劃中
