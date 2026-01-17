-- ==========================================
-- 集團管理員資料表建立與修改
-- ==========================================

-- 1. 修改 partner_merchants 表 - 新增年費和合約欄位
ALTER TABLE partner_merchants 
ADD COLUMN IF NOT EXISTS annual_fee_amount DECIMAL(10,2) DEFAULT 50000,
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS fee_payment_status VARCHAR(20) DEFAULT 'pending';

-- 2. 修改 courses 表 - 新增分潤比例欄位
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS revenue_share_percentage DECIMAL(5,2) DEFAULT 70.00,
ADD COLUMN IF NOT EXISTS platform_share_percentage DECIMAL(5,2) DEFAULT 30.00;

-- 3. 修改 teachers 表 - 新增分潤和銀行帳戶欄位
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS default_revenue_share DECIMAL(5,2) DEFAULT 70.00,
ADD COLUMN IF NOT EXISTS bank_account VARCHAR(255);

-- 4. 建立 merchant_fees 表 - 店家年費管理
CREATE TABLE IF NOT EXISTS merchant_fees (
  id BIGSERIAL PRIMARY KEY,
  merchant_id BIGINT REFERENCES partner_merchants(id) ON DELETE CASCADE,
  fee_year INTEGER NOT NULL,
  annual_fee DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_date DATE,
  contract_start_date DATE,
  contract_end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(merchant_id, fee_year)
);

-- 5. 建立 revenue_sharing 表 - 分潤記錄
CREATE TABLE IF NOT EXISTS revenue_sharing (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('teacher', 'merchant')),
  entity_id BIGINT NOT NULL,
  revenue_source VARCHAR(50) NOT NULL,
  source_id BIGINT,
  total_amount DECIMAL(10,2) NOT NULL,
  platform_share DECIMAL(10,2) NOT NULL,
  entity_share DECIMAL(10,2) NOT NULL,
  share_percentage DECIMAL(5,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  settlement_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 建立 supply_products 表 - 供應產品目錄
CREATE TABLE IF NOT EXISTS supply_products (
  id BIGSERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  product_code VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100),
  brand VARCHAR(100),
  supply_price DECIMAL(10,2) NOT NULL,
  suggested_retail_price DECIMAL(10,2),
  description TEXT,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 建立 merchant_supply_orders 表 - 店家進貨訂單
CREATE TABLE IF NOT EXISTS merchant_supply_orders (
  id BIGSERIAL PRIMARY KEY,
  merchant_id BIGINT REFERENCES partner_merchants(id) ON DELETE CASCADE,
  order_number VARCHAR(100) UNIQUE NOT NULL,
  order_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  delivery_status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 建立 merchant_supply_order_items 表 - 進貨訂單明細
CREATE TABLE IF NOT EXISTS merchant_supply_order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES merchant_supply_orders(id) ON DELETE CASCADE,
  supply_product_id BIGINT REFERENCES supply_products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_merchant_fees_merchant ON merchant_fees(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_fees_year ON merchant_fees(fee_year);
CREATE INDEX IF NOT EXISTS idx_revenue_sharing_entity ON revenue_sharing(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_revenue_sharing_status ON revenue_sharing(status);
CREATE INDEX IF NOT EXISTS idx_supply_orders_merchant ON merchant_supply_orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_supply_order_items_order ON merchant_supply_order_items(order_id);

-- 完成
SELECT 'Database schema updated successfully!' AS status;
