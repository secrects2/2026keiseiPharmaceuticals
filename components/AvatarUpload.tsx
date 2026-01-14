'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  userId: number
  onUploadSuccess: (url: string) => void
}

export default function AvatarUpload({ currentAvatarUrl, userId, onUploadSuccess }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片檔案')
      return
    }

    // 檢查檔案大小（最大 2MB）
    if (file.size > 2 * 1024 * 1024) {
      alert('圖片大小不能超過 2MB')
      return
    }

    // 顯示預覽
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // 上傳到 Supabase Storage
    await uploadAvatar(file)
  }

  const uploadAvatar = async (file: File) => {
    setUploading(true)

    try {
      const supabase = createClient()

      // 生成唯一檔名
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // 上傳到 Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // 取得公開 URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // 更新資料庫
      const { error: updateError } = await supabase
        .from('member_profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) throw updateError

      onUploadSuccess(publicUrl)
      alert('大頭照上傳成功！')
    } catch (error: any) {
      console.error('Failed to upload avatar:', error)
      alert(`上傳失敗：${error.message || '請稍後再試'}`)
      setPreview(currentAvatarUrl || null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* 預覽 */}
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
        {preview ? (
          <Image
            src={preview}
            alt="Avatar"
            width={128}
            height={128}
            className="object-cover"
          />
        ) : (
          <span className="text-4xl text-gray-400">👤</span>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-sm">上傳中...</div>
          </div>
        )}
      </div>

      {/* 上傳按鈕 */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {uploading ? '上傳中...' : '更換大頭照'}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        支援 JPG、PNG 格式，檔案大小不超過 2MB
      </p>
    </div>
  )
}
