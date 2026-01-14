'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Award, Download, CheckCircle, Calendar } from 'lucide-react'
import jsPDF from 'jspdf'

interface Certificate {
  id: number
  certificate_number: string
  issue_date: string
  verification_code: string
  is_valid: boolean
  course: {
    course_name: string
    duration_hours: number
  }
  teacher: {
    teacher_name: string
  }
}

export default function CertificatesPage() {
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<Certificate[]>([])

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // 取得 user_id
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!userData) return

      // 取得證書列表
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          course:courses!certificates_course_id_fkey(course_name, duration_hours, teacher_id),
          teacher:teachers!certificates_course_id_fkey(teacher_name)
        `)
        .eq('user_id', userData.id)
        .order('issue_date', { ascending: false })

      if (error) throw error

      setCertificates(data || [])
    } catch (error) {
      console.error('Error fetching certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = async (cert: Certificate, userName: string) => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // 設定背景色
    pdf.setFillColor(245, 247, 250)
    pdf.rect(0, 0, 297, 210, 'F')

    // 邊框
    pdf.setDrawColor(99, 102, 241)
    pdf.setLineWidth(2)
    pdf.rect(10, 10, 277, 190)

    // 標題
    pdf.setFontSize(32)
    pdf.setTextColor(99, 102, 241)
    pdf.text('Certificate of Completion', 148.5, 40, { align: 'center' })
    
    pdf.setFontSize(24)
    pdf.setTextColor(0, 0, 0)
    pdf.text('課程完成證書', 148.5, 55, { align: 'center' })

    // 分隔線
    pdf.setDrawColor(99, 102, 241)
    pdf.setLineWidth(0.5)
    pdf.line(50, 65, 247, 65)

    // 內容
    pdf.setFontSize(16)
    pdf.setTextColor(60, 60, 60)
    pdf.text('This is to certify that', 148.5, 80, { align: 'center' })

    pdf.setFontSize(24)
    pdf.setTextColor(0, 0, 0)
    pdf.text(userName, 148.5, 95, { align: 'center' })

    pdf.setFontSize(16)
    pdf.setTextColor(60, 60, 60)
    pdf.text('has successfully completed the course', 148.5, 110, { align: 'center' })

    pdf.setFontSize(20)
    pdf.setTextColor(99, 102, 241)
    pdf.text(cert.course.course_name, 148.5, 125, { align: 'center' })

    pdf.setFontSize(14)
    pdf.setTextColor(60, 60, 60)
    pdf.text(`Duration: ${cert.course.duration_hours} hours`, 148.5, 138, { align: 'center' })
    pdf.text(`Instructor: ${cert.teacher?.teacher_name || 'N/A'}`, 148.5, 148, { align: 'center' })

    // 底部資訊
    pdf.setFontSize(12)
    pdf.setTextColor(100, 100, 100)
    pdf.text(`Issue Date: ${new Date(cert.issue_date).toLocaleDateString('zh-TW')}`, 40, 175)
    pdf.text(`Certificate No: ${cert.certificate_number}`, 40, 183)
    pdf.text(`Verification Code: ${cert.verification_code}`, 40, 191)

    // 印章/簽名區
    pdf.setDrawColor(99, 102, 241)
    pdf.circle(230, 180, 15)
    pdf.setFontSize(10)
    pdf.text('Official Seal', 230, 182, { align: 'center' })

    // 儲存
    pdf.save(`certificate_${cert.certificate_number}.pdf`)
  }

  const handleDownload = async (cert: Certificate) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('email', user.email)
        .single()

      await generatePDF(cert, userData?.name || user.email || 'Student')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('證書下載失敗')
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">我的證書</h1>

        {certificates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">尚無證書</p>
            <p className="text-sm text-gray-400">完成課程後即可獲得證書</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border-2 border-indigo-100"
              >
                {/* 證書圖示 */}
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Award className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* 課程名稱 */}
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                  {cert.course.course_name}
                </h3>

                {/* 課程資訊 */}
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center justify-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>時數：{cert.course.duration_hours} 小時</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    <span>頒發日期：{new Date(cert.issue_date).toLocaleDateString('zh-TW')}</span>
                  </div>
                </div>

                {/* 證書編號 */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 mb-1">證書編號</p>
                  <p className="text-sm font-mono font-semibold text-gray-900">
                    {cert.certificate_number}
                  </p>
                </div>

                {/* 驗證碼 */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 mb-1">驗證碼</p>
                  <p className="text-sm font-mono font-semibold text-gray-900">
                    {cert.verification_code}
                  </p>
                </div>

                {/* 有效狀態 */}
                {cert.is_valid ? (
                  <div className="flex items-center justify-center mb-4 text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-semibold">證書有效</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center mb-4 text-red-600">
                    <span className="font-semibold">證書已失效</span>
                  </div>
                )}

                {/* 下載按鈕 */}
                <button
                  onClick={() => handleDownload(cert)}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  下載證書 PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
