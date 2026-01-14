-- 建立註冊用戶的 Database Function
CREATE OR REPLACE FUNCTION public.register_user(
  p_open_id TEXT,
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id INTEGER;
  v_result JSON;
BEGIN
  -- 1. 插入 users 表
  INSERT INTO public.users (open_id, email, role, created_at, updated_at)
  VALUES (p_open_id, p_email, 'user', NOW(), NOW())
  RETURNING id INTO v_user_id;

  -- 2. 插入 member_profiles 表
  INSERT INTO public.member_profiles (user_id, full_name, phone, created_at, updated_at)
  VALUES (v_user_id, p_full_name, p_phone, NOW(), NOW());

  -- 3. 插入 sport_coins 表（初始 100 運動幣）
  INSERT INTO public.sport_coins (user_id, amount, created_at, updated_at)
  VALUES (v_user_id, 100, NOW(), NOW());

  -- 4. 返回結果
  v_result := json_build_object(
    'success', true,
    'user_id', v_user_id
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 授予執行權限
GRANT EXECUTE ON FUNCTION public.register_user TO anon, authenticated;
