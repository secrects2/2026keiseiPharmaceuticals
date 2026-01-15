#!/usr/bin/env node

/**
 * 建立測試帳號腳本
 * 使用 Supabase Admin API 建立 teacher 和 store 測試帳號
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少環境變數：NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testAccounts = [
  {
    email: 'teacher@keiseipharm.com',
    password: 'teacher123',
    name: '授課老師',
    role: 'admin'
  },
  {
    email: 'store@keiseipharm.com',
    password: 'store123',
    name: '店家管理員',
    role: 'admin'
  }
]

async function createTestAccounts() {
  console.log('🚀 開始建立測試帳號...\n')

  for (const account of testAccounts) {
    console.log(`📧 處理帳號：${account.email}`)

    // 1. 檢查帳號是否已存在
    const { data: existingUser } = await supabase.auth.admin.listUsers()
    const userExists = existingUser?.users?.some(u => u.email === account.email)

    if (userExists) {
      console.log(`   ⚠️  帳號已存在，跳過建立`)
      continue
    }

    // 2. 建立 Auth 帳號
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        name: account.name,
        email_verified: true
      }
    })

    if (authError) {
      console.error(`   ❌ Auth 帳號建立失敗：${authError.message}`)
      continue
    }

    console.log(`   ✅ Auth 帳號建立成功 (ID: ${authData.user.id})`)

    // 3. 在 public.users 表中建立對應記錄
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        email: account.email,
        name: account.name,
        role: account.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (dbError) {
      console.error(`   ❌ 資料庫記錄建立失敗：${dbError.message}`)
    } else {
      console.log(`   ✅ 資料庫記錄建立成功`)
    }

    console.log()
  }

  // 4. 驗證結果
  console.log('📊 驗證測試帳號...\n')
  
  const { data: users } = await supabase
    .from('users')
    .select('email, name, role')
    .in('email', testAccounts.map(a => a.email))

  if (users && users.length > 0) {
    console.log('✅ 測試帳號列表：')
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.name}, ${user.role})`)
    })
  } else {
    console.log('⚠️  未找到測試帳號')
  }

  console.log('\n🎉 完成！')
}

createTestAccounts().catch(error => {
  console.error('❌ 執行失敗：', error)
  process.exit(1)
})
