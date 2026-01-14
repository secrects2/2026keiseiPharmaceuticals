-- 建立註冊用戶的 Database Function
CREATE OR REPLACE FUNCTION public.register_user(
  p_open_id TEXT,
  p_email TEXT,
  p_name TEXT,
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
  -- 1. 插入 users 表（包含 name 和 phone）
  INSERT INTO public.users (open_id, email, name, phone, role, created_at, updated_at)
  VALUES (p_open_id, p_email, p_name, p_phone, 'user', NOW(), NOW())
  RETURNING id INTO v_user_id;

  -- 2. 插入 member_profiles 表
  INSERT INTO public.member_profiles (user_id, created_at, updated_at)
  VALUES (v_user_id, NOW(), NOW());

  -- 3. 插入 sport_coins 表（初始 100 運動幣，coin_type 為 'earned'）
  INSERT INTO public.sport_coins (user_id, coin_type, amount, source, created_at, updated_at)
  VALUES (v_user_id, 'earned', 100, 'registration_bonus', NOW(), NOW());

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
