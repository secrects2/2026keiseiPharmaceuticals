import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少環境變數')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function resetAdminPassword() {
  try {
    console.log('🔍 檢查 admin@keiseipharm.com 帳號...')
    
    // 查詢帳號
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ 查詢失敗：', listError)
      return
    }
    
    const adminUser = users.find(u => u.email === 'admin@keiseipharm.com')
    
    if (!adminUser) {
      console.log('❌ 找不到 admin@keiseipharm.com 帳號')
      console.log('📝 建立新帳號...')
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: 'admin@keiseipharm.com',
        password: 'admin123',
        email_confirm: true
      })
      
      if (error) {
        console.error('❌ 建立帳號失敗：', error)
        return
      }
      
      console.log('✅ 帳號建立成功！')
      console.log('📧 Email: admin@keiseipharm.com')
      console.log('🔑 Password: admin123')
    } else {
      console.log('✅ 找到帳號，ID:', adminUser.id)
      console.log('📝 重設密碼為 admin123...')
      
      const { error } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { password: 'admin123' }
      )
      
      if (error) {
        console.error('❌ 重設密碼失敗：', error)
        return
      }
      
      console.log('✅ 密碼重設成功！')
      console.log('📧 Email: admin@keiseipharm.com')
      console.log('🔑 Password: admin123')
    }
    
  } catch (error) {
    console.error('❌ 執行失敗：', error)
  }
}

resetAdminPassword()
