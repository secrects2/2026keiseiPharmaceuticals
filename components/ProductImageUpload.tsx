'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { useToast } from './Toast'

interface ProductImage {
  id: string
  url: string
  file?: File
}

interface ProductImageUploadProps {
  productId?: number
  initialImages?: string[]
  onImagesChange: (urls: string[]) => void
  maxImages?: number
}

export default function ProductImageUpload({ 
  productId,
  initialImages = [],
  onImagesChange,
  maxImages = 5 
}: ProductImageUploadProps) {
  const { showToast } = useToast()
  const [images, setImages] = useState<ProductImage[]>(
    initialImages.map((url, index) => ({ id: `init-${index}`, url }))
  )
  const [uploading, setUploading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    // 檢查數量限制
    if (images.length + files.length > maxImages) {
      showToast(`最多只能上傳 ${maxImages} 張圖片`, 'warning')
      return
    }

    // 檢查檔案類型和大小
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showToast('請選擇圖片檔案', 'error')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('圖片大小不能超過 5MB', 'error')
        return
      }
    }

    // 建立預覽
    const newImages: ProductImage[] = []
    for (const file of files) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const id = `temp-${Date.now()}-${Math.random()}`
        newImages.push({
          id,
          url: reader.result as string,
          file,
        })
        
        if (newImages.length === files.length) {
          setImages(prev => [...prev, ...newImages])
        }
      }
      reader.readAsDataURL(file)
    }

    // 如果有 productId，立即上傳
    if (productId) {
      await uploadImages(files)
    }
  }

  const uploadImages = async (files: File[]) => {
    setUploading(true)

    try {
      const supabase = createClient()
      const uploadedUrls: string[] = []

      for (const file of files) {
        // 生成唯一檔名
        const fileExt = file.name.split('.').pop()
        const fileName = `product-${productId}-${Date.now()}-${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        // 上傳到 Storage
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) throw uploadError

        // 取得公開 URL
        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      // 更新圖片列表
      const allUrls = [...images.map(img => img.url), ...uploadedUrls]
      onImagesChange(allUrls)
      
      showToast('圖片上傳成功！', 'success')
    } catch (error: any) {
      console.error('Failed to upload images:', error)
      showToast(`上傳失敗：${error.message || '請稍後再試'}`, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages.map(img => img.url))
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)

    setImages(newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    onImagesChange(images.map(img => img.url))
  }

  return (
    <div className="space-y-4">
      {/* 圖片網格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-move group"
          >
            <Image
              src={image.url}
              alt={`Product ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
            {index === 0 && (
              <div className="absolute bottom-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                主圖
              </div>
            )}
          </div>
        ))}

        {/* 上傳按鈕 */}
        {images.length < maxImages && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <span className="text-4xl text-gray-400">+</span>
            <span className="text-sm text-gray-500 mt-2">上傳圖片</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <p className="text-xs text-gray-500">
        支援 JPG、PNG 格式，單張圖片不超過 5MB，最多 {maxImages} 張。拖曳圖片可調整順序，第一張為主圖。
      </p>

      {uploading && (
        <div className="text-center text-sm text-gray-500">
          上傳中...
        </div>
      )}
    </div>
  )
}
