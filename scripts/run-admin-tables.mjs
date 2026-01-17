import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 從 .env.local 讀取環境變數
const envContent = readFileSync(join(__dirname, '../.env.local'), 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
)

async function runSQL() {
  try {
    console.log('📊 開始建立/修改資料表...\n')

    const sql = readFileSync(join(__dirname, 'create-admin-tables.sql'), 'utf-8')
    
    // 分割 SQL 語句（以分號分隔）
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))

    let successCount = 0
    let errorCount = 0

    for (const statement of statements) {
      if (!statement) continue

      try {
        const { data, error } = await supabase.rpc('exec', { sql: statement + ';' })
        
        if (error) {
          // 嘗試使用 Supabase REST API
          const response = await fetch(
            `${envVars.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': envVars.SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${envVars.SUPABASE_SERVICE_ROLE_KEY}`
              },
              body: JSON.stringify({ sql: statement + ';' })
            }
          )

          if (!response.ok) {
            console.log(`❌ 執行失敗: ${statement.substring(0, 80)}...`)
            console.log(`   錯誤: ${error?.message || 'Unknown error'}`)
            errorCount++
            continue
          }
        }

        successCount++
        const preview = statement.substring(0, 80).replace(/\s+/g, ' ')
        console.log(`✅ ${preview}...`)

      } catch (err) {
        console.log(`❌ 執行失敗: ${statement.substring(0, 80)}...`)
        console.log(`   錯誤: ${err.message}`)
        errorCount++
      }
    }

    console.log(`\n📊 完成！成功: ${successCount}, 失敗: ${errorCount}`)

  } catch (error) {
    console.error('❌ 錯誤:', error.message)
  }
}

runSQL()
