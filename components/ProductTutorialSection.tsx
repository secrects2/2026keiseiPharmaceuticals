'use client'

import { useState } from 'react'
import { Play, BookOpen, Clock, CheckCircle, Video } from 'lucide-react'

interface ProductTutorial {
  quick_start_video_url: string | null
  tutorial_video_url: string | null
}

interface ProductTutorialSectionProps {
  product: {
    product_name: string
    quick_start_video_url: string | null
    tutorial_video_url: string | null
  }
}

export default function ProductTutorialSection({ product }: ProductTutorialSectionProps) {
  const [activeVideo, setActiveVideo] = useState<'quick' | 'full' | null>(null)

  const hasQuickStart = !!product.quick_start_video_url
  const hasFullTutorial = !!product.tutorial_video_url

  if (!hasQuickStart && !hasFullTutorial) return null

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <Video className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">產品使用教學影片</h3>
          <p className="text-gray-600">專業老師親自示範，讓您快速上手</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 快速入門影片 */}
        {hasQuickStart && (
          <div className="bg-white rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">快速入門</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>3-5 分鐘</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              快速了解產品基本使用方法，適合第一次使用的新手
            </p>

            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>產品開箱與組裝</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>基本使用方法</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>注意事項與保養</span>
              </li>
            </ul>

            {activeVideo === 'quick' ? (
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <iframe
                  src={product.quick_start_video_url || ''}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <button
                onClick={() => setActiveVideo('quick')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                <span>播放快速入門</span>
              </button>
            )}
          </div>
        )}

        {/* 完整教學影片 */}
        {hasFullTutorial && (
          <div className="bg-white rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">完整教學</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>30-60 分鐘</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              深入學習產品的各種使用技巧，讓您成為使用達人
            </p>

            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>進階使用技巧</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>常見問題解答</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>訓練計畫建議</span>
              </li>
            </ul>

            {activeVideo === 'full' ? (
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <iframe
                  src={product.tutorial_video_url || ''}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <button
                onClick={() => setActiveVideo('full')}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                <span>播放完整教學</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 bg-white rounded-lg p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Video className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">為什麼要觀看教學影片？</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 由專業老師親自示範，確保動作正確</li>
              <li>• 避免錯誤使用造成運動傷害</li>
              <li>• 學習更多進階技巧，提升訓練效果</li>
              <li>• 隨時重複觀看，不限次數</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
