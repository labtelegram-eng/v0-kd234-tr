"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface MusicTrack {
  id: number
  name: string
  artist: string
  coverImage: string
  youtubeUrl: string
  order: number
  isActive: boolean
}

interface MusicSectionProps {
  onVideoPlay?: (video: any) => void
}

export function MusicSection({ onVideoPlay }: MusicSectionProps) {
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    loadMusicTracks()
  }, [])

  const loadMusicTracks = async () => {
    try {
      const response = await fetch("/api/music-tracks?active=true")
      if (response.ok) {
        const data = await response.json()
        setMusicTracks(data.tracks)
      }
    } catch (error) {
      console.error("Load music tracks error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Функция извлечения YouTube ID
  const extractYouTubeId = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return match ? match[1] : ""
  }

  // Функция получения превью YouTube
  const getYouTubeThumbnail = (url: string): string => {
    const videoId = extractYouTubeId(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "/placeholder.svg"
  }

  const handleTrackClick = (track: MusicTrack) => {
    // Открываем YouTube в новой вкладке
    window.open(track.youtubeUrl, "_blank", "noopener,noreferrer")
  }

  const getTrackCover = (track: MusicTrack): string => {
    // Приоритет: пользовательская обложка -> YouTube превью -> placeholder
    if (track.coverImage && track.coverImage !== "/placeholder.svg") {
      return track.coverImage
    }
    return getYouTubeThumbnail(track.youtubeUrl) || "/placeholder.svg?height=300&width=400&text=Music+Cover"
  }

  const nextSlide = () => {
    if (musicTracks.length > 3 && !isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 3 >= musicTracks.length ? 0 : prev + 3))
        setIsTransitioning(false)
      }, 300)
    }
  }

  const prevSlide = () => {
    if (musicTracks.length > 3 && !isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev - 3 < 0 ? Math.max(0, musicTracks.length - 3) : prev - 3))
        setIsTransitioning(false)
      }, 300)
    }
  }

  const goToSlide = (index: number) => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(index * 3)
        setIsTransitioning(false)
      }, 300)
    }
  }

  // Получаем треки для текущего слайда
  const getCurrentTracks = () => {
    return musicTracks.slice(currentIndex, currentIndex + 3)
  }

  // Проверяем, есть ли еще треки для показа
  const hasNextSlide = currentIndex + 3 < musicTracks.length
  const hasPrevSlide = currentIndex > 0

  if (isLoading) {
    return (
      <section className="py-8 sm:py-10 md:py-12 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Тайская музыка</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="h-48 sm:h-56 md:h-64 bg-gray-300 rounded-t-lg"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (musicTracks.length === 0) {
    return (
      <section className="py-8 sm:py-10 md:py-12 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Тайская музыка</h2>
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-lg p-8">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Музыкальные треки не найдены</h3>
              <p className="text-gray-600">Скоро здесь появится коллекция тайской музыки</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const displayTracks = getCurrentTracks()

  return (
    <section className="py-8 sm:py-10 md:py-12 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Тайская музыка</h2>

        {/* Main Content with Navigation */}
        <div className="relative z-50">
          {/* Left Navigation Button - positioned relative to the cards */}
          {musicTracks.length > 3 && (
            <Button
              onClick={prevSlide}
              disabled={!hasPrevSlide || isTransitioning}
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-[60] w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white border-2 border-gray-200 hover:border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 ${
                !hasPrevSlide || isTransitioning
                  ? "opacity-30 cursor-not-allowed scale-90"
                  : "opacity-90 hover:opacity-100 hover:scale-110 hover:border-purple-400"
              }`}
              variant="outline"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </Button>
          )}

          {/* Right Navigation Button - positioned relative to the cards */}
          {musicTracks.length > 3 && (
            <Button
              onClick={nextSlide}
              disabled={!hasNextSlide || isTransitioning}
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-[60] w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white border-2 border-gray-200 hover:border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 ${
                !hasNextSlide || isTransitioning
                  ? "opacity-30 cursor-not-allowed scale-90"
                  : "opacity-90 hover:opacity-100 hover:scale-110 hover:border-purple-400"
              }`}
              variant="outline"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </Button>
          )}

          {/* Tracks Container with Smooth Scrolling Effect */}
          <div className="overflow-visible pt-4 pb-4 relative z-50">
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-all duration-700 ease-in-out ${
                isTransitioning
                  ? "transform translate-x-8 opacity-60 scale-95"
                  : "transform translate-x-0 opacity-100 scale-100"
              }`}
            >
              {displayTracks.map((track, index) => (
                <div
                  key={`${track.id}-${currentIndex}`}
                  className="group overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 transform bg-white rounded-lg shadow-sm music-card relative z-[55]"
                  onClick={() => handleTrackClick(track)}
                  style={{
                    transitionDelay: `${index * 50}ms`,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                    filter: "drop-shadow(0 1px 3px rgba(0, 0, 0, 0.05))",
                  }}
                >
                  <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={getTrackCover(track) || "/placeholder.svg"}
                      alt={track.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=300&width=400&text=Music+Cover"
                      }}
                    />

                    {/* Overlay with gradient */}
                    <div className="absolute inset-0 bg-black/20 transition-all duration-500 ease-in-out group-hover:bg-black/5"></div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 opacity-90 group-hover:opacity-100">
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" fill="currentColor" />
                      </div>
                    </div>

                    {/* YouTube Badge */}
                    <div className="absolute top-2 right-2">
                      <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        <span>YouTube</span>
                      </div>
                    </div>

                    {/* External Link Icon */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/70 text-white p-1 rounded-full">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Track Number */}
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full">
                      #{track.order}
                    </div>
                  </div>

                  <div className="p-2 sm:p-3">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">{track.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{track.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        {musicTracks.length > 3 && (
          <div className="flex justify-center mt-8 space-x-3 relative z-50">
            {Array.from({ length: Math.ceil(musicTracks.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / 3) === index
                    ? "bg-purple-600 scale-125 shadow-lg ring-2 ring-purple-200"
                    : "bg-gray-300 hover:bg-purple-300 hover:scale-110"
                } ${isTransitioning ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                aria-label={`Перейти к странице ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Page Info */}
        {musicTracks.length > 3 && (
          <div className="text-center mt-4 relative z-50">
            <p className="text-sm text-gray-500">
              Страница {Math.floor(currentIndex / 3) + 1} из {Math.ceil(musicTracks.length / 3)} • Показано{" "}
              {displayTracks.length} из {musicTracks.length} треков
            </p>
          </div>
        )}
      </div>
      <style jsx>{`
        .music-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
          filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.08)) !important;
          z-index: 60 !important;
        }
      `}</style>
    </section>
  )
}
