# 資料庫欄位檢查報告

## 關聯資料表欄位結構

### 1. users 表
| 欄位 | 類型 | 可空 | 說明 |
|------|------|------|------|
| id | integer | NO | 主鍵 |
| open_id | varchar | NO | 開放ID |
| name | text | YES | 姓名 |
| email | varchar | YES | 電子郵件 |
| phone | varchar | YES | 電話 |
| line_user_id | varchar | YES | LINE用戶ID |
| avatar | text | YES | 頭像 |
| login_method | varchar | YES | 登入方式 |
| role | USER-DEFINED | NO | 角色（admin/user） |
| community_id | integer | YES | 所屬社區ID |
| created_at | timestamp | NO | 建立時間 |
| updated_at | timestamp | NO | 更新時間 |
| last_signed_in | timestamp | NO | 最後登入時間 |

### 2. communities 表
| 欄位 | 類型 | 可空 | 說明 |
|------|------|------|------|
| id | integer | NO | 主鍵 |
| name | varchar | NO | 社區名稱 |
| code | varchar | NO | 社區代碼 |
| manager_id | integer | NO | 管理員ID |
| address | text | YES | 地址 |
| phone | varchar | YES | 電話 |
| email | varchar | YES | 電子郵件 |
| status | varchar | NO | 狀態 |
| member_count | integer | YES | 會員數量 |
| created_at | timestamp | NO | 建立時間 |
| updated_at | timestamp | NO | 更新時間 |

### 3. member_profiles 表
| 欄位 | 類型 | 可空 | 說明 |
|------|------|------|------|
| id | integer | NO | 主鍵 |
| user_id | integer | NO | 用戶ID（外鍵） |
| line_official_id | varchar | YES | LINE官方帳號ID |
| birthday | timestamp | YES | 生日 |
| gender | varchar | YES | 性別 |
| address | text | YES | 地址 |
| interests | text | YES | 興趣 |
| tags | text | YES | 標籤 |
| notes | text | YES | 備註 |
| created_at | timestamp | NO | 建立時間 |
| updated_at | timestamp | NO | 更新時間 |

### 4. sport_coins 表
| 欄位 | 類型 | 可空 | 說明 |
|------|------|------|------|
| id | integer | NO | 主鍵 |
| user_id | integer | NO | 用戶ID（外鍵） |
| coin_type | varchar | NO | 幣別類型 |
| **amount** | numeric | NO | **金額（注意：不是balance！）** |
| source | varchar | YES | 來源 |
| expiry_date | timestamp | YES | 到期日 |
| status | USER-DEFINED | YES | 狀態 |
| created_at | timestamp | NO | 建立時間 |
| updated_at | timestamp | NO | 更新時間 |

### 5. member_activities 表
| 欄位 | 類型 | 可空 | 說明 |
|------|------|------|------|
| id | integer | NO | 主鍵 |
| user_id | integer | NO | 用戶ID（外鍵） |
| community_id | integer | NO | 社區ID（外鍵） |
| activity_type | varchar | NO | 活動類型 |
| activity_name | varchar | NO | 活動名稱 |
| activity_date | timestamp | NO | 活動日期 |
| participation_status | varchar | NO | 參與狀態 |
| notes | text | YES | 備註 |
| created_at | timestamp | NO | 建立時間 |

### 6. member_purchases 表
| 欄位 | 類型 | 可空 | 說明 |
|------|------|------|------|
| id | integer | NO | 主鍵 |
| user_id | integer | NO | 用戶ID（外鍵） |
| community_id | integer | NO | 社區ID（外鍵） |
| product_id | integer | NO | 產品ID（外鍵） |
| product_name | varchar | NO | 產品名稱 |
| quantity | integer | NO | 數量 |
| unit_price | numeric | NO | 單價 |
| total_amount | numeric | NO | 總金額 |
| purchase_date | timestamp | NO | 購買日期 |
| status | varchar | NO | 狀態 |
| notes | text | YES | 備註 |
| created_at | timestamp | NO | 建立時間 |

---

## 代碼中的使用檢查

### ✅ 已修復的問題
1. **sport_coins.balance → sport_coins.amount**
   - 檔案：`lib/db.ts`, `components/MembersTable.tsx`
   - 狀態：已修復

2. **users 表查詢使用 email 而非 id**
   - 檔案：`app/admin/page.tsx`, `app/admin/members/page.tsx`
   - 狀態：已修復

### ⚠️ 需要注意的空值處理

1. **users.community_id 可以是 NULL**
   - admin 角色的用戶 community_id 為 NULL
   - 需要使用 `?.` 可選鏈處理 `community` 物件

2. **member_profiles 可能不存在**
   - 新用戶可能沒有 profile 資料
   - 需要使用 `?.` 可選鏈處理 `profile` 物件

3. **sport_coins 可能不存在**
   - 新用戶可能沒有運動幣資料
   - 需要使用 `?.` 可選鏈處理 `sport_coin` 物件

---

## 建議的資料完整性檢查

### 測試用戶（admin@keiseipharm.com）應該有：
- ✅ users 表記錄
- ✅ auth.users 表記錄
- ✅ member_profiles 表記錄
- ✅ sport_coins 表記錄
- ❓ member_activities 表記錄（可選）
- ❓ member_purchases 表記錄（可選）

### 查詢測試用戶完整資料：
```sql
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  u.community_id,
  c.name as community_name,
  mp.id as profile_id,
  sc.id as coin_id,
  sc.amount as coin_amount
FROM users u
LEFT JOIN communities c ON u.community_id = c.id
LEFT JOIN member_profiles mp ON u.id = mp.user_id
LEFT JOIN sport_coins sc ON u.id = sc.user_id
WHERE u.email = 'admin@keiseipharm.com';
```
