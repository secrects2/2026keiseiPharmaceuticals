import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const testAccounts = [
  { email: 'admin@keiseipharm.com', password: 'admin123', role: 'admin' },
  { email: 'teacher@keiseipharm.com', password: 'teacher123', role: 'teacher' },
  { email: 'store@keiseipharm.com', password: 'store123', role: 'store' }
]

async function fixAccounts() {
  console.log('🔍 檢查並修復測試帳號...\n')

  for (const account of testAccounts) {
    console.log(`處理 ${account.email}...`)

    // 1. 檢查帳號是否存在
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    let user = authUsers?.users?.find(u => u.email === account.email)

    if (!user) {
      // 2. 如果不存在，建立新帳號
      console.log(`  ❌ 帳號不存在，建立中...`)
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true
      })

      if (createError) {
        console.error(`  ❌ 建立失敗：${createError.message}`)
        continue
      }

      user = newUser.user
      console.log(`  ✅ 帳號已建立 (ID: ${user.id})`)
    } else {
      console.log(`  ✅ 帳號已存在 (ID: ${user.id})`)
      
      // 更新密碼（確保密碼正確）
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: account.password }
      )
      
      if (updateError) {
        console.error(`  ⚠️  更新密碼失敗：${updateError.message}`)
      } else {
        console.log(`  ✅ 密碼已更新`)
      }
    }

    // 3. 檢查 users 表中的記錄
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      // 如果 users 表中沒有記錄，建立一個
      console.log(`  ❌ users 表中無記錄，建立中...`)
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: account.email,
          role: account.role,
          name: account.role === 'admin' ? '集團管理員' : 
                account.role === 'teacher' ? '授課老師' : '店家管理員'
        })

      if (insertError) {
        console.error(`  ❌ 建立 users 記錄失敗：${insertError.message}`)
      } else {
        console.log(`  ✅ users 記錄已建立 (role: ${account.role})`)
      }
    } else {
      // 更新角色（確保角色正確）
      if (userData.role !== account.role) {
        console.log(`  ⚠️  角色不符 (${userData.role} → ${account.role})，更新中...`)
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: account.role })
          .eq('id', user.id)

        if (updateError) {
          console.error(`  ❌ 更新角色失敗：${updateError.message}`)
        } else {
          console.log(`  ✅ 角色已更新`)
        }
      } else {
        console.log(`  ✅ 角色正確 (${userData.role})`)
      }
    }

    console.log()
  }

  console.log('✅ 所有測試帳號已檢查並修復完成！')
  console.log('\n測試帳號：')
  console.log('- admin@keiseipharm.com / admin123')
  console.log('- teacher@keiseipharm.com / teacher123')
  console.log('- store@keiseipharm.com / store123')
}

fixAccounts().catch(console.error)
