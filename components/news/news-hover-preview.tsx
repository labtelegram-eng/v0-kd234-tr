"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Calendar, Clock, Eye, Heart, User, ChevronDown, X } from "lucide-react"
import { formatDate, formatTime, getCategoryInfo, getTagInfo } from "./news-utils"
import type { NewsItem } from "./news-types"

interface NewsHoverPreviewProps {
  newsItem: NewsItem | null
  isVisible: boolean
  triggerElement: HTMLElement | null
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClose: () => void
}

export function NewsHoverPreview({
  newsItem,
  isVisible,
  triggerElement,
  onMouseEnter,
  onMouseLeave,
  onClose,
}: NewsHoverPreviewProps) {
  const [fixedPosition, setFixedPosition] = useState({ x: 0, y: 0 })
  const [isReady, setIsReady] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && newsItem && triggerElement) {
      setIsClosing(false)
      setIsOpening(true)

      const timer = setTimeout(() => {
        const triggerRect = triggerElement.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const previewWidth = 480
        const previewHeight = 220

        // Позиционируем под заголовком с левого края
        let viewportX = triggerRect.left // Выравниваем по левому краю заголовка
        let viewportY = triggerRect.bottom + 8 // Под заголовком с небольшим зазором (8px)

        // Проверяем, помещается ли окно по горизонтали
        if (viewportX + previewWidth > viewportWidth - 10) {
          // Если не помещается, сдвигаем влево
          viewportX = viewportWidth - previewWidth - 10
        }

        // Проверяем, не выходит ли за левую границу
        if (viewportX < 10) {
          viewportX = 10
        }

        // Проверяем вертикальные границы
        if (viewportY + previewHeight > viewportHeight - 10) {
          // Если не помещается снизу, показываем сверху от заголовка
          viewportY = triggerRect.top - previewHeight - 8
        }

        // Проверяем верхнюю границу
        if (viewportY < 10) {
          // Если не помещается сверху, возвращаем под заголовок
          viewportY = triggerRect.bottom + 8
        }

        setFixedPosition({ x: viewportX, y: viewportY })
        setIsReady(true)

        // Завершаем анимацию открытия
        setTimeout(() => {
          setIsOpening(false)
        }, 100)
      }, 50)

      return () => clearTimeout(timer)
    } else if (!isVisible && isReady) {
      // Запускаем анимацию закрытия
      setIsClosing(true)
      setIsOpening(false)

      const closeTimer = setTimeout(() => {
        setIsReady(false)
        setIsClosing(false)
      }, 300) // Длительность анимации закрытия

      return () => clearTimeout(closeTimer)
    } else {
      setIsReady(false)
      setIsClosing(false)
      setIsOpening(false)
    }
  }, [isVisible, triggerElement, newsItem, isReady])

  // Обработчик изменения размера окна для закрытия preview
  useEffect(() => {
    if (!isVisible) return

    const handleResize = () => {
      onClose()
    }

    const handleScroll = () => {
      onClose()
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isVisible, onClose])

  // Не рендерим компонент если он не готов и не закрывается
  if (!isReady && !isClosing && !isOpening) return null

  const categoryInfo = getCategoryInfo(newsItem?.category || "")

  // Определяем состояние анимации
  const getAnimationState = () => {
    if (isOpening) {
      return {
        transform: "scale(0.8) translateY(-20px)",
        opacity: 0,
      }
    } else if (isClosing) {
      return {
        transform: "scale(0.8) translateY(-20px)",
        opacity: 0,
      }
    } else if (isReady) {
      return {
        transform: "scale(1) translateY(0)",
        opacity: 1,
      }
    } else {
      return {
        transform: "scale(0.8) translateY(-20px)",
        opacity: 0,
      }
    }
  }

  return (
    <div
      ref={previewRef}
      className="fixed z-50"
      style={{
        left: `${fixedPosition.x}px`,
        top: `${fixedPosition.y}px`,
        ...getAnimationState(),
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: isReady && !isClosing && !isOpening ? "auto" : "none",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Card className="w-[480px] h-[220px] shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden p-0">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 w-6 h-6 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-3 h-3 text-white" />
        </button>

        {/* Horizontal layout: Image on left (full height), content on right */}
        <div className="flex h-full">
          {/* Left side - High Quality Image (full height, no padding) */}
          <div className="relative w-48 h-full overflow-hidden">
            {/* Высококачественное изображение с Next.js Image */}
            <Image
              src={newsItem?.image || "/placeholder.svg?height=220&width=192&text=News"}
              alt={newsItem?.title || "News image"}
              width={192}
              height={220}
              quality={95} // Высокое качество для четкости
              priority={true} // Приоритетная загрузка
              className="absolute inset-0 w-full h-full object-cover"
              sizes="192px"
              style={{
                objectFit: "cover",
                objectPosition: "center",
              }}
              onError={(e) => {
                // Fallback на placeholder при ошибке загрузки
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=220&width=192&text=News"
              }}
            />

            {/* Dark overlay for better badge visibility */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/30 z-10" />

            {/* Badges - positioned at top left of image */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-20">
              <Badge className={`${categoryInfo.color} border-0 text-xs shadow-lg font-medium backdrop-blur-sm`}>
                {categoryInfo.name}
              </Badge>
              {newsItem?.isFeatured && (
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs shadow-lg font-medium backdrop-blur-sm">
                  🔥
                </Badge>
              )}
            </div>

            {/* Tags - positioned at bottom left of image */}
            {newsItem?.tags && newsItem.tags.length > 0 && (
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-1 z-20">
                {newsItem.tags.slice(0, 1).map((tagId) => {
                  const tagInfo = getTagInfo(tagId)
                  return (
                    <Badge
                      key={tagId}
                      className={`${tagInfo.color} border-0 text-xs shadow-lg font-medium backdrop-blur-sm`}
                    >
                      #{tagInfo.name}
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right side - Content */}
          <div className="flex-1 p-4 bg-white flex flex-col justify-between">
            {/* Top section */}
            <div className="flex-1">
              {/* Meta Info */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(newsItem?.publishedAt || new Date())}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(newsItem?.publishedAt || new Date())}</span>
                </div>
              </div>

              {/* Author */}
              {newsItem?.author && (
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={newsItem.author.avatar || "/placeholder.svg"} alt={newsItem.author.name} />
                    <AvatarFallback className="text-xs">
                      <User className="h-2 w-2" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">{newsItem.author.name}</span>
                    {newsItem.author.role && <span className="text-gray-500 ml-1">• {newsItem.author.role}</span>}
                  </div>
                </div>
              )}

              {/* Title - Black text */}
              <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 leading-tight">{newsItem?.title}</h3>

              {/* Excerpt - Gray text */}
              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{newsItem?.excerpt}</p>
            </div>

            {/* Bottom section - поднята выше */}
            <div className="mt-2">
              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span className="font-medium">{newsItem?.viewCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span className="font-medium">{newsItem?.likeCount || 0}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {Math.floor((newsItem?.viewCount || 0) / 20) + 1} комментариев
                </div>
              </div>

              {/* Continue reading button with animated arrow - поднята выше */}
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs py-2 group shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => {
                  if (newsItem?.id) {
                    window.open(`/news/${newsItem.id}`, "_blank")
                  }
                }}
              >
                <span className="font-semibold">Читать полностью</span>
                <ChevronDown className="w-3 h-3 ml-2 group-hover:animate-bounce transition-transform group-hover:translate-y-0.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Arrow pointer pointing up to the trigger element */}
        <div
          className="absolute w-3 h-3 bg-white/95 backdrop-blur-sm transform rotate-45 border-l border-t border-gray-200/50"
          style={{
            left: "20px", // Позиционируем стрелку ближе к левому краю
            top: "-6px",
          }}
        />
      </Card>
    </div>
  )
}
