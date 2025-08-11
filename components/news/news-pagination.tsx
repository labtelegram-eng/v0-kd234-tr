"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { BookOpen, MapPin, Camera, Heart, Compass, ArrowRight, Star } from 'lucide-react'
import { useState, useRef, useCallback, useEffect } from "react"
import { getAllBlogPosts } from "@/lib/simple-database"

interface NewsPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
}

export function NewsPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: NewsPaginationProps) {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [circleScale, setCircleScale] = useState(1)
  const blogBlockRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const [randomPosts, setRandomPosts] = useState<any[]>([])

  useEffect(() => {
    const allPosts = getAllBlogPosts()
    if (allPosts.length > 0) {
      // Shuffle and take 4 random posts
      const shuffled = [...allPosts].sort(() => 0.5 - Math.random())
      setRandomPosts(shuffled.slice(0, 4))
    }
  }, [])

  const handlePageChange = (page: number) => {
    onPageChange(page)
    // Плавная прокрутка наверх
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (blogBlockRef.current) {
      const rect = blogBlockRef.current.getBoundingClientRect()
      setCursorPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
  }, [])

  // Анимация пульсации кружка
  useEffect(() => {
    if (isHovering) {
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = (elapsed % 2000) / 2000 // 2 секунды на полный цикл

        // Создаем плавную синусоидальную анимацию
        const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.3 // от 0.7 до 1.3
        setCircleScale(scale)

        if (isHovering) {
          animationRef.current = requestAnimationFrame(animate)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      setCircleScale(1)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isHovering])

  const getVisiblePages = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="mt-12 mb-8">
      {/* Информация о результатах */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600">
          Показано <span className="font-semibold text-gray-900">{startItem}</span> -
          <span className="font-semibold text-gray-900"> {endItem}</span> из
          <span className="font-semibold text-gray-900"> {totalItems}</span> новостей
        </p>
      </div>

      {/* Кнопки пагинации */}
      <div className="flex items-center justify-center gap-2">
        {/* Первая страница */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="hidden sm:flex items-center gap-1 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
        >
          <ChevronsLeft className="w-4 h-4" />
          <span className="hidden md:inline">Первая</span>
        </Button>

        {/* Предыдущая страница */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Назад</span>
        </Button>

        {/* Номера страниц */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <div key={index}>
              {page === "..." ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page as number)}
                  className={`min-w-[40px] ${
                    currentPage === page
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-md"
                      : "hover:bg-blue-50 hover:border-blue-300"
                  }`}
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Следующая страница */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
        >
          <span className="hidden sm:inline">Вперед</span>
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Последняя страница */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="hidden sm:flex items-center gap-1 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
        >
          <span className="hidden md:inline">Последняя</span>
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Мобильная версия - упрощенная */}
      <div className="sm:hidden mt-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Назад
        </Button>

        <span className="text-sm text-gray-600 font-medium">
          {currentPage} из {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1"
        >
          Вперед
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Объединенный блок: Предложение блога + Может быть интересно */}
      <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Предложение посетить блог */}
        <div
          ref={blogBlockRef}
          className="relative overflow-hidden cursor-pointer"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Фоновый градиент */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-95"></div>

          {/* Курсор-кружок с анимацией */}
          {isHovering && (
            <div
              className="absolute pointer-events-none z-10 w-16 h-16 bg-white rounded-full"
              style={{
                left: cursorPosition.x,
                top: cursorPosition.y,
                opacity: 0.05,
                transform: `translate(-50%, -50%) scale(${circleScale})`,
                transition: "none",
              }}
            />
          )}

          {/* Основной контент */}
          <div className="relative p-4 z-20 pointer-events-none">
            <div className="flex items-center justify-between">
              {/* Левая часть с текстом и иконками */}
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 mr-3">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Больше о Таиланде</h3>
                </div>

                <p className="text-white/90 text-sm mb-3 max-w-md">
                  Культура, традиции и секретные места в нашем блоге
                </p>

                {/* Мини-иконки преимуществ */}
                <div className="flex items-center gap-4 text-white/80 text-xs">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-yellow-300" />
                    <span>Места</span>
                  </div>
                  <div className="flex items-center">
                    <Camera className="w-3 h-3 mr-1 text-yellow-300" />
                    <span>Фото</span>
                  </div>
                  <div className="flex items-center">
                    <Heart className="w-3 h-3 mr-1 text-yellow-300" />
                    <span>Советы</span>
                  </div>
                </div>
              </div>

              {/* Правая часть с кнопкой */}
              <div className="ml-4">
                <Button
                  onClick={() => (window.location.href = "/blog")}
                  className="group bg-white text-purple-600 hover:bg-yellow-400 hover:text-purple-700 px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg border-0 pointer-events-auto"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4 transition-transform group-hover:rotate-45 duration-300" />В блог
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Декоративный элемент */}
          <div className="absolute top-2 right-2 opacity-20">
            <Star className="w-6 h-6 text-white animate-pulse" />
          </div>
        </div>

        {/* Разделительная линия */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

        {/* Блок с подборкой случайных статей */}
        <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
          {randomPosts.length > 0 && (
            
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {randomPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100"
                    onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                  >
                    <div className="relative h-32 overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
                      {post.image && post.image !== "/placeholder.svg" ? (
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full ${
                            index === 0
                              ? "bg-gradient-to-br from-blue-400 to-purple-500"
                              : index === 1
                                ? "bg-gradient-to-br from-green-400 to-blue-500"
                                : index === 2
                                  ? "bg-gradient-to-br from-orange-400 to-red-500"
                                  : "bg-gradient-to-br from-purple-400 to-pink-500"
                          }`}
                        />
                      )}
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                          {post.category === "culture"
                            ? "Культура"
                            : post.category === "travel"
                              ? "Путешествия"
                              : post.category === "food"
                                ? "Еда"
                                : post.category === "tips"
                                  ? "Советы"
                                  : post.category === "history"
                                    ? "История"
                                    : post.category === "nature"
                                      ? "Природа"
                                      : post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{post.readTime} мин чтения</span>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{Math.floor(Math.random() * 50) + 5}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            
          )}
        </div>
      </div>
    </div>
  )
}
