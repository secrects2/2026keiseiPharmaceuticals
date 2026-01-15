-- 建立測試帳號腳本
-- 注意：這些帳號的密碼需要在 Supabase Auth 中設定

-- 1. 建立授課老師帳號（如果不存在）
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'teacher@keiseipharm.com',
  crypt('teacher123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"授課老師","email_verified":true}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'teacher@keiseipharm.com'
);

-- 2. 建立店家帳號（如果不存在）
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'store@keiseipharm.com',
  crypt('store123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"店家管理員","email_verified":true}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'store@keiseipharm.com'
);

-- 3. 在 public.users 表中建立對應記錄
INSERT INTO public.users (email, name, role, created_at, updated_at)
SELECT 'teacher@keiseipharm.com', '授課老師', 'admin', now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE email = 'teacher@keiseipharm.com'
);

INSERT INTO public.users (email, name, role, created_at, updated_at)
SELECT 'store@keiseipharm.com', '店家管理員', 'admin', now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE email = 'store@keiseipharm.com'
);

-- 查詢結果確認
SELECT email, raw_user_meta_data->>'name' as name FROM auth.users 
WHERE email IN ('admin@keiseipharm.com', 'teacher@keiseipharm.com', 'store@keiseipharm.com');

SELECT email, name, role FROM public.users 
WHERE email IN ('admin@keiseipharm.com', 'teacher@keiseipharm.com', 'store@keiseipharm.com');
