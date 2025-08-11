"use client"

import { useState, useEffect } from "react"
import { Video } from "lucide-react"

interface CultureVideo {
  id: number
  title: string
  description: string
  youtubeUrl: string
  thumbnail: string
  isActive: boolean
}

export function CultureVideoSection() {
  const [cultureVideo, setCultureVideo] = useState<CultureVideo | null>(null)

  useEffect(() => {
    loadCultureVideo()
  }, [])

  const loadCultureVideo = async () => {
    try {
      const response = await fetch("/api/culture-video")
      if (response.ok) {
        const data = await response.json()
        setCultureVideo(data.video)
      }
    } catch (error) {
      console.error("Load culture video error:", error)
    }
  }

  // Функция извлечения YouTube ID
  const extractYouTubeId = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return match ? match[1] : ""
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Видео о тайской культуре</h2>

      {cultureVideo && cultureVideo.isActive && cultureVideo.youtubeUrl ? (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(cultureVideo.youtubeUrl)}`}
              title={cultureVideo.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{cultureVideo.title}</h3>
            <p className="text-gray-600">{cultureVideo.description}</p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="opacity-70">Видео временно недоступно</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
