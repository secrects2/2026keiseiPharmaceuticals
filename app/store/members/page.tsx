'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, ArrowLeft, DollarSign, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

interface Member {
  user_id: number
  user_name: string
  user_email: string
  total_orders: number
  total_spent: number
  last_purchase_date: string
}

export default function StoreMembersPage() {
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<Member[]>([])
  const [merchantId, setMerchantId] = useState<number | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // 取得店家資訊
      const { data: merchantData } = await supabase
        .from('partner_merchants')
        .select('id')
        .eq('contact_email', user.email)
        .single()

      if (!merchantData) return
      setMerchantId(merchantData.id)

      // 取得在此店家消費過的會員
      const { data: salesData } = await supabase
        .from('sports_sales')
        .select(`
          created_by,
          total_amount,
          sale_date,
          users:created_by (
            id,
            name,
            email
          )
        `)
        .eq('merchant_id', merchantData.id)

      if (!salesData) return

      // 整理會員資料
      const memberMap = new Map<number, Member>()
      
      salesData.forEach((sale: any) => {
        const userId = sale.created_by
        if (!userId || !sale.users) return

        if (memberMap.has(userId)) {
          const member = memberMap.get(userId)!
          member.total_orders += 1
          member.total_spent += parseFloat(sale.total_amount)
          if (new Date(sale.sale_date) > new Date(member.last_purchase_date)) {
            member.last_purchase_date = sale.sale_date
          }
        } else {
          memberMap.set(userId, {
            user_id: userId,
            user_name: sale.users.name || '未設定',
            user_email: sale.users.email || '',
            total_orders: 1,
            total_spent: parseFloat(sale.total_amount),
            last_purchase_date: sale.sale_date
          })
        }
      })

      const membersArray = Array.from(memberMap.values())
      membersArray.sort((a, b) => b.total_spent - a.total_spent)
      
      setMembers(membersArray)
    } catch (error) {
      console.error('載入會員資料失敗：', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/store" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">店家會員管理</h1>
            <p className="text-gray-600 mt-2">查看在本店消費過的會員</p>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">總會員數</h3>
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{members.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">總訂單數</h3>
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {members.reduce((sum, m) => sum + m.total_orders, 0)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">總消費金額</h3>
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              NT$ {members.reduce((sum, m) => sum + m.total_spent, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* 會員列表 */}
        {members.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">尚無會員</h3>
            <p className="text-gray-600">當有顧客在您的店家消費後，會員資料會顯示在這裡</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    會員資訊
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    訂單數
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    總消費
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最後消費日期
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{member.user_name}</div>
                        <div className="text-sm text-gray-500">{member.user_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.total_orders} 筆</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        NT$ {member.total_spent.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(member.last_purchase_date).toLocaleDateString('zh-TW')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
