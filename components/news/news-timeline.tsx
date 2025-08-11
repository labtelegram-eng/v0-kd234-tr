"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Heart, MessageCircle, User, Star } from "lucide-react"
import { NewsHoverPreview } from "./news-hover-preview"
import { NewsPagination } from "./news-pagination"
import { formatDate, formatTime, getCategoryInfo, getTagInfo } from "./news-utils"
import type { NewsItem } from "./news-types"

interface NewsTimelineProps {
  filteredNews: NewsItem[]
  onResetFilters?: () => void
}

const ITEMS_PER_PAGE = 10

// Компонент для отображения времени и даты
function NewsTimeHeader({ publishedAt }: { publishedAt: string }) {
  return (
    <div className="flex items-center gap-4 mb-3">
      <div className="text-lg font-bold text-purple-600">{formatTime(publishedAt)}</div>
      <div className="text-sm text-gray-500">{formatDate(publishedAt)}</div>
    </div>
  )
}

// Компонент для отображения только тегов (в старом месте)
function NewsTags({ newsItem }: { newsItem: NewsItem }) {
  if (!newsItem.tags || newsItem.tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {newsItem.tags.map((tagId) => {
        const tagInfo = getTagInfo(tagId)
        return (
          <Badge key={tagId} variant="outline" className={`${tagInfo.color} font-medium px-2 py-1 text-xs`}>
            #{tagInfo.name}
          </Badge>
        )
      })}
    </div>
  )
}

// Компонент для отображения только категорий (будет под описанием)
function NewsCategories({ newsItem }: { newsItem: NewsItem }) {
  const categoryInfo = getCategoryInfo(newsItem.category)

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Badge className={`${categoryInfo.color} font-medium px-2 py-0.5 text-xs`}>
        {categoryInfo.name.toUpperCase()}
      </Badge>
      {newsItem.isFeatured && (
        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium px-2 py-0.5 text-xs">
          ГЛАВНАЯ
        </Badge>
      )}
    </div>
  )
}

// Компонент для отображения автора
function NewsAuthor({ author }: { author?: NewsItem["author"] }) {
  if (!author) return null

  return (
    <div className="flex items-center gap-2 mb-3">
      <Avatar className="h-6 w-6">
        <AvatarImage src={author.avatar || "/placeholder.svg"} alt={author.name} />
        <AvatarFallback className="text-xs">
          <User className="h-3 w-3" />
        </AvatarFallback>
      </Avatar>
      <div className="text-sm text-gray-600">
        <span className="font-semibold">{author.name}</span>
        {author.role && <span className="text-gray-500"> • {author.role}</span>}
      </div>
    </div>
  )
}

// Компонент для отображения заголовка с hover эффектом
function NewsTitle({
  title,
  onMouseEnter,
  onMouseLeave,
}: {
  title: string
  onMouseEnter: (e: React.MouseEvent<HTMLHeadingElement>) => void
  onMouseLeave: () => void
}) {
  return (
    <h2
      className="text-xl font-bold text-blue-600 hover:text-blue-800 cursor-pointer transition-colors duration-200 mb-3 leading-tight"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {title}
    </h2>
  )
}

// Компонент для отображения статистики
function NewsStats({ newsItem }: { newsItem: NewsItem }) {
  return (
    <div className="flex items-center gap-6 text-sm text-gray-500">
      <div className="flex items-center gap-1">
        <Eye className="w-4 h-4" />
        <span className="font-medium">{newsItem.viewCount || 0}</span>
      </div>
      <div className="flex items-center gap-1">
        <Heart className="w-4 h-4" />
        <span className="font-medium">{newsItem.likeCount || 0}</span>
      </div>
      <div className="flex items-center gap-1">
        <MessageCircle className="w-4 h-4" />
        <span className="font-medium">{Math.floor((newsItem.viewCount || 0) / 20) + 1} комментариев</span>
      </div>
    </div>
  )
}

// Компонент для timeline точки с соединительной линией
function TimelineDotWithLine({ isFeatured, isLast }: { isFeatured?: boolean; isLast: boolean }) {
  return (
    <div className="flex flex-col items-center relative">
      {/* Timeline точка */}
      <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-2 border-white shadow-lg flex-shrink-0 z-10 relative">
        {isFeatured && <Star className="w-2 h-2 text-white m-0.5" fill="currentColor" />}
      </div>

      {/* Соединительная линия (показывается для всех кроме последнего элемента) */}
      {!isLast && <div className="w-0.5 h-16 bg-gradient-to-b from-blue-400 via-purple-400 to-gray-300 mt-2" />}
    </div>
  )
}

// Компонент для отображения пустого состояния
function EmptyNewsState({ onResetFilters }: { onResetFilters?: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
          <MessageCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Новости не найдены</h3>
        <p className="text-gray-600 mb-6">
          По вашему запросу не найдено ни одной новости. Попробуйте изменить фильтры или поисковый запрос.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Сбросить фильтры
          </button>
        )}
      </div>
    </div>
  )
}

// Основной компонент timeline
export function NewsTimeline({ filteredNews, onResetFilters }: NewsTimelineProps) {
  const [hoveredNews, setHoveredNews] = useState<NewsItem | null>(null)
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleTitleMouseEnter = (newsItem: NewsItem, element: HTMLElement) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredNews(newsItem)
      setTriggerElement(element)
      setIsPreviewVisible(true)
    }, 200)
  }

  const handleTitleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    leaveTimeoutRef.current = setTimeout(() => {
      setIsPreviewVisible(false)
    }, 100)
  }

  const handlePreviewMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }
  }

  const handlePreviewMouseLeave = () => {
    setIsPreviewVisible(false)
  }

  const handlePreviewClose = () => {
    setIsPreviewVisible(false)
    setHoveredNews(null)
    setTriggerElement(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (!Array.isArray(filteredNews)) {
    return <div className="text-center text-gray-500 py-8">Нет новостей для отображения</div>
  }

  if (filteredNews.length === 0) {
    return <EmptyNewsState onResetFilters={onResetFilters} />
  }

  // Вычисляем пагинацию
  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentNews = filteredNews.slice(startIndex, endIndex)

  return (
    <div className="relative">
      {/* Timeline Container */}
      <div className="space-y-8">
        {currentNews.map((newsItem, index) => (
          <article
            key={newsItem.id}
            className="timeline-item relative flex items-start gap-6 p-4 rounded-lg transition-all duration-700 ease-in-out cursor-pointer bg-white hover:bg-gray-100"
          >
            {/* Timeline Sidebar - содержит точку и соединительную линию */}
            <div className="timeline-sidebar flex flex-col items-center">
              <TimelineDotWithLine isFeatured={newsItem.isFeatured} isLast={index === currentNews.length - 1} />
            </div>

            {/* News Content Container - основной контент новости */}
            <div className="news-content flex-1 min-w-0">
              {/* Header Section - время и дата */}
              <header className="news-header">
                <NewsTimeHeader publishedAt={newsItem.publishedAt} />
              </header>

              {/* Meta Section - только теги и автор (БЕЗ КАТЕГОРИЙ) */}
              <div className="news-meta">
                <NewsTags newsItem={newsItem} />
                <NewsAuthor author={newsItem.author} />
              </div>

              {/* Main Content Section - заголовок и описание */}
              <div className="news-main">
                <NewsTitle
                  title={newsItem.title}
                  onMouseEnter={(e) => handleTitleMouseEnter(newsItem, e.currentTarget)}
                  onMouseLeave={handleTitleMouseLeave}
                />
                <p className="news-excerpt text-gray-700 mb-4 leading-relaxed">{newsItem.excerpt}</p>

                {/* Categories Section - КАТЕГОРИИ ПОД ОПИСАНИЕМ */}
                <NewsCategories newsItem={newsItem} />
              </div>

              {/* Footer Section - статистика */}
              <footer className="news-footer">
                <NewsStats newsItem={newsItem} />
              </footer>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      <NewsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={filteredNews.length}
        itemsPerPage={ITEMS_PER_PAGE}
      />

      {/* Hover Preview Component */}
      <NewsHoverPreview
        newsItem={hoveredNews}
        isVisible={isPreviewVisible}
        triggerElement={triggerElement}
        onMouseEnter={handlePreviewMouseEnter}
        onMouseLeave={handlePreviewMouseLeave}
        onClose={handlePreviewClose}
      />
    </div>
  )
}
