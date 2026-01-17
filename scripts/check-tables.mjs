import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTables() {
  try {
    // 取得所有表名
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name')

    if (error) {
      // 使用 RPC 或直接查詢
      const { data: rpcData, error: rpcError } = await supabase.rpc('exec', {
        sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
      })
      
      if (rpcError) {
        console.log('無法使用 information_schema，列出已知表：')
        const knownTables = [
          'users', 'teachers', 'partner_merchants', 'courses',
          'sports_products', 'sports_sales', 'sports_inventory',
          'store_events', 'store_event_registrations', 'store_schedules',
          'events', 'notifications'
        ]
        
        for (const tableName of knownTables) {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(0)
          
          if (!error) {
            console.log(`\n✅ 表：${tableName}`)
            console.log('   (表存在)')
          }
        }
        return
      }
    }

    console.log('📊 資料庫表列表：\n')
    if (tables) {
      tables.forEach(t => console.log(`- ${t.table_name}`))
    }

  } catch (error) {
    console.error('錯誤：', error.message)
  }
}

checkTables()
