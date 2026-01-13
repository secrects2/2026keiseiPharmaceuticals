-- 建立測試管理員帳號
-- 步驟 1：在 auth.users 表建立認證用戶
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@keiseipharm.com',
  crypt('admin', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (email) DO NOTHING;

-- 步驟 2：在 public.users 表建立用戶資料
-- 注意：這裡的 id 是 integer，不是 uuid
INSERT INTO public.users (
  name,
  email,
  role,
  community_id,
  created_at,
  updated_at
) VALUES (
  '系統管理員',
  'admin@keiseipharm.com',
  'admin',
  NULL,
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- 查詢確認
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  u.community_id,
  au.id as auth_user_id
FROM public.users u
LEFT JOIN auth.users au ON u.email = au.email
WHERE u.email = 'admin@keiseipharm.com';
