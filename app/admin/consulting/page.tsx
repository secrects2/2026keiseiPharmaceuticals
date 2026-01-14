import { createClient } from '@/lib/supabase/server'

export default async function ConsultingPage() {
  const supabase = await createClient()

  // 取得所有顧問服務活動
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false })

  if (error) {
    console.error('Failed to fetch events:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">顧問服務</h1>
          <p className="text-gray-600 mt-1">管理健康諮詢與顧問服務活動</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          + 新增服務活動
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總服務數</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{events?.length || 0}</p>
            </div>
            <div className="text-3xl">💼</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">本月服務</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {events?.filter(e => {
                  const eventDate = new Date(e.event_date)
                  const now = new Date()
                  return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
                }).length || 0}
              </p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">即將到來</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {events?.filter(e => new Date(e.event_date) > new Date()).length || 0}
              </p>
            </div>
            <div className="text-3xl">⏰</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">已完成</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">
                {events?.filter(e => new Date(e.event_date) < new Date()).length || 0}
              </p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
      </div>

      {/* 服務列表 */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">服務活動列表</h2>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="搜尋活動..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="">全部活動</option>
                <option value="upcoming">即將到來</option>
                <option value="completed">已完成</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  活動名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  活動日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  地點
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  參與人數
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events && events.length > 0 ? (
                events.map((event) => {
                  const eventDate = new Date(event.event_date)
                  const isUpcoming = eventDate > new Date()
                  const isPast = eventDate < new Date()
                  
                  return (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{event.event_name}</p>
                          <p className="text-xs text-gray-500 mt-1">{event.description || '無描述'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{eventDate.toLocaleDateString('zh-TW')}</p>
                          <p className="text-gray-500">{eventDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{event.location || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{event.max_participants || '-'}</td>
                      <td className="px-6 py-4">
                        {isUpcoming ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            即將到來
                          </span>
                        ) : isPast ? (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            已完成
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            進行中
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                            編輯
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                            詳情
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <p className="text-4xl mb-2">💼</p>
                      <p className="text-sm">尚無顧問服務活動</p>
                      <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                        新增第一個服務活動
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 快速統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">近期活動</h3>
          <div className="space-y-3">
            {events && events.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.event_name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(event.event_date).toLocaleDateString('zh-TW')}
                  </p>
                </div>
                <div className="text-2xl">
                  {new Date(event.event_date) > new Date() ? '⏰' : '✅'}
                </div>
              </div>
            ))}
            {(!events || events.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">暫無活動</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">服務類型分布</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🏃</div>
                <span className="text-sm font-medium text-gray-900">運動諮詢</span>
              </div>
              <span className="text-sm font-bold text-blue-600">
                {events?.filter(e => e.event_name.includes('運動')).length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🥗</div>
                <span className="text-sm font-medium text-gray-900">營養諮詢</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                {events?.filter(e => e.event_name.includes('營養')).length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🧘</div>
                <span className="text-sm font-medium text-gray-900">健康講座</span>
              </div>
              <span className="text-sm font-bold text-purple-600">
                {events?.filter(e => e.event_name.includes('講座')).length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
