"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Calendar, ChevronLeft, ChevronRight, ArrowRight, Newspaper, Users, MapPin, Coffee, Plane, AlertTriangle, DollarSign, Search, Shield, Leaf, AlertCircle } from 'lucide-react'
import Link from "next/link"
import { SmartImage } from "@/components/ui/smart-image"

interface NewsItem {
id: number
title: string
excerpt: string
image: string
publishedAt: string
isActive: boolean
isFeatured: boolean
category: string
}

const NEWS_CATEGORY_ICONS = {
tourism: { icon: MapPin, color: "text-blue-600", bgColor: "from-blue-100 to-blue-200" },
culture: { icon: Users, color: "text-purple-600", bgColor: "from-purple-100 to-purple-200" },
food: { icon: Coffee, color: "text-green-600", bgColor: "from-green-100 to-green-200" },
events: { icon: Calendar, color: "text-orange-600", bgColor: "from-orange-100 to-orange-200" },
transport: { icon: Plane, color: "text-indigo-600", bgColor: "from-indigo-100 to-indigo-200" },
important: { icon: AlertTriangle, color: "text-red-600", bgColor: "from-red-100 to-red-200" },
investments: { icon: DollarSign, color: "text-emerald-600", bgColor: "from-emerald-100 to-emerald-200" },
investigation: { icon: Search, color: "text-gray-600", bgColor: "from-gray-100 to-gray-200" },
police: { icon: Shield, color: "text-blue-800", bgColor: "from-blue-200 to-blue-300" },
violations: { icon: AlertCircle, color: "text-red-700", bgColor: "from-red-200 to-red-300" },
ecology: { icon: Leaf, color: "text-green-700", bgColor: "from-green-200 to-green-300" },
general: { icon: Newspaper, color: "text-gray-600", bgColor: "from-gray-100 to-gray-200" },
}

function truncateText(text: string, max = 111) {
if (!text) return ""
const clean = text.trim()
if (clean.length <= max) return clean
const truncated = clean.slice(0, max)
const lastSpace = truncated.lastIndexOf(" ")
const safe = lastSpace > 80 ? truncated.slice(0, lastSpace) : truncated
return safe.trim() + "…"
}

const DESKTOP_TRANSITION_MS = 1600
const MOBILE_TRANSITION_MS = 1300

function formatRuDate(dateString: string) {
return new Date(dateString).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
}

/**
* Right column scroller for 10 latest news (desktop).
* Height reduced by ~5% for better visual alignment: 190px (was 200px).
*/
function RightNewsScroller({ items, excludeId }: { items: NewsItem[]; excludeId?: number }) {
const list = (excludeId ? items.filter((n) => n.id !== excludeId) : items).slice(0, 10)

if (list.length === 0) return null

return (
<div className="flex-none bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden h-[190px]">
  <div className="h-full overflow-y-auto right-news-scroll" role="region" aria-label="Лента новостей">
    <ul className="divide-y divide-gray-200">
      {list.map((news) => (
        <li key={news.id} className="bg-white hover:bg-gray-50 transition-colors duration-150">
          <Link href={`/news/${news.id}`} className="block group">
            <div className="flex h-20">
              <div className="relative w-20 h-full flex-shrink-0 overflow-hidden">
                <SmartImage
                  src={news.image}
                  alt={news.title}
                  width={120}
                  height={80}
                  quality={70}
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-black/10 transition-colors duration-200 group-hover:bg-black/5 pointer-events-none" />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 hover:text-emerald-700 transition-colors duration-200">
                    {news.title}
                  </h4>
                </div>
                <div className="flex items-center text-xs text-gray-500 flex-shrink-0">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{formatRuDate(news.publishedAt)}</span>
                </div>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  </div>
  <style jsx>{`
    .right-news-scroll {
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scrollbar-color: rgba(17, 24, 39, 0.28) rgba(17, 24, 39, 0.08);
      overscroll-behavior: contain;
    }
    :global(.right-news-scroll::-webkit-scrollbar) { width: 6px; height: 6px; }
    :global(.right-news-scroll::-webkit-scrollbar-track) { background: rgba(17, 24, 39, 0.08); }
    :global(.right-news-scroll::-webkit-scrollbar-thumb) {
      background-color: rgba(17, 24, 39, 0.28);
      border-radius: 9999px;
      border: 2px solid transparent;
      background-clip: content-box;
      transition: background-color 150ms ease-in-out;
    }
    :global(.right-news-scroll:hover::-webkit-scrollbar-thumb) { background-color: rgba(17, 24, 39, 0.38); }
  `}</style>
</div>
)
}

export function NewsSection() {
const [allNews, setAllNews] = useState<NewsItem[]>([])
const [recentNews, setRecentNews] = useState<NewsItem[]>([])
const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0)
const [isLoading, setIsLoading] = useState(true)

// transitions
const [isTransitioning, setIsTransitioning] = useState(false)
const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
const intervalRef = useRef<NodeJS.Timeout | null>(null)

// mobile
const [mobileIndex, setMobileIndex] = useState(0)
const [isMobileTransitioning, setIsMobileTransitioning] = useState(false)
const [isMobile, setIsMobile] = useState(false)
const mobileIntervalRef = useRef<NodeJS.Timeout | null>(null)

useEffect(() => {
loadNews()
const checkMobile = () => setIsMobile(window.innerWidth < 1024)
checkMobile()
window.addEventListener("resize", checkMobile)
return () => window.removeEventListener("resize", checkMobile)
}, [])

useEffect(() => {
if (allNews.length > 1) {
if (isMobile) {
  stopDesktopAutoSlide()
  startMobileAutoSlide()
} else {
  stopMobileAutoSlide()
  startDesktopAutoSlide()
}
}
return () => {
stopDesktopAutoSlide()
stopMobileAutoSlide()
if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
}
}, [allNews, isMobile])

const startDesktopAutoSlide = () => {
if (intervalRef.current) return
intervalRef.current = setInterval(() => {
startDesktopTransition((prev) => (prev + 1) % allNews.length)
}, 6000)
}
const stopDesktopAutoSlide = () => {
if (intervalRef.current) {
clearInterval(intervalRef.current)
intervalRef.current = null
}
}

const startMobileAutoSlide = () => {
if (mobileIntervalRef.current) return
mobileIntervalRef.current = setInterval(() => {
if (!isMobileTransitioning) {
  setIsMobileTransitioning(true)
  setMobileIndex((prev) => (prev + 1) % allNews.length)
  setTimeout(() => setIsMobileTransitioning(false), MOBILE_TRANSITION_MS)
}
}, 6000)
}
const stopMobileAutoSlide = () => {
if (mobileIntervalRef.current) {
clearInterval(mobileIntervalRef.current)
mobileIntervalRef.current = null
}
}

const startDesktopTransition = (nextIndexUpdater: (prev: number) => number) => {
if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
setIsTransitioning(true)
setCurrentFeaturedIndex(nextIndexUpdater)
transitionTimeoutRef.current = setTimeout(() => {
setIsTransitioning(false)
}, DESKTOP_TRANSITION_MS)
}

const loadNews = async () => {
try {
setIsLoading(true)
const allResponse = await fetch("/api/news")
if (allResponse.ok) {
  const allData = await allResponse.json()
  const limitedNews = (allData.news || []).slice(0, 10)
  setAllNews(limitedNews)
}
const recentResponse = await fetch("/api/news?recent=3")
if (recentResponse.ok) {
  const recentData = await recentResponse.json()
  setRecentNews(recentData.news || [])
}
} catch (error) {
console.error("Load news error:", error)
} finally {
setIsLoading(false)
}
}

const handleNextNews = () => {
if (allNews.length <= 1 || isTransitioning) return
startDesktopTransition((prev) => (prev + 1) % allNews.length)
}
const handlePrevNews = () => {
if (allNews.length <= 1 || isTransitioning) return
startDesktopTransition((prev) => (prev - 1 + allNews.length) % allNews.length)
}
const handleDotClick = (index: number) => {
if (allNews.length <= 1 || isTransitioning || index === currentFeaturedIndex) return
if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
setIsTransitioning(true)
setCurrentFeaturedIndex(index)
transitionTimeoutRef.current = setTimeout(() => setIsTransitioning(false), DESKTOP_TRANSITION_MS)
}

const currentFeaturedNews = allNews[currentFeaturedIndex]
const currentMobileNews = allNews[mobileIndex]
const topRightNews = recentNews[0] // keep the larger top-right card

if (isLoading) {
return (
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Последние новости</h2>
  <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse h-[484px]">
        <div className="h-80 bg-gray-200" />
        <div className="p-6 h-[104px]">
          <div className="h-4 bg-gray-200 rounded mb-4" />
          <div className="h-6 bg-gray-200 rounded mb-3" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    </div>
    <div className="flex flex-col h-full">
      <div className="flex-1 mb-4 bg-white rounded-lg shadow-sm overflow-hidden animate-pulse min-h-[223px]">
        <div className="h-32 bg-gray-200" />
        <div className="p-4 flex-1">
          <div className="h-4 bg-gray-200 rounded mb-2" />
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      {/* New scroller skeleton with exact height of two former small cards */}
      <div className="flex-none bg-white rounded-lg shadow-sm overflow-hidden animate-pulse h-[190px]">
        <div className="h-full">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex h-12 border-b border-gray-100 last:border-0">
              <div className="w-20 h-full bg-gray-200" />
              <div className="p-3 flex-1">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-2.5 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  {/* Mobile skeleton */}
  <div className="lg:hidden space-y-4">
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse h-[205px]">
      <div className="h-32 bg-gray-200" />
      <div className="p-4 h-[73px]">
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-5 bg-gray-200 rounded mb-3" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse h-20">
        <div className="flex h-full">
          <div className="w-20 h-full bg-gray-200 flex-shrink-0" />
          <div className="p-3 flex-1 flex flex-col justify-between">
            <div className="h-3 bg-gray-200 rounded mb-1" />
            <div className="h-2 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    ))}
  </div>
</section>
)
}

return (
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
<div className="flex items-center justify-between mb-6 sm:mb-8">
  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Новости</h2>
  <Link
    href="/news"
    className="text-sm text-emerald-700 hover:text-emerald-800 font-medium transition-colors duration-200 flex items-center gap-1 group"
  >
    Смотреть все
    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
  </Link>
</div>

{/* Desktop */}
<div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Featured */}
  {currentFeaturedNews && (
    <div className="lg:col-span-2 relative">
      <Link href={`/news/${currentFeaturedNews.id}`}>
        <div className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer relative h-[484px] flex flex-col">
          <div className="relative h-80 overflow-hidden flex-shrink-0">
            {/* Image with smooth blur in/out */}
            <div
              key={`featured-image-${currentFeaturedIndex}`}
              className={`absolute inset-0 will-change-transform transition-[filter,transform,opacity] duration-700 ease-out ${
                isTransitioning ? "apply-blur" : "remove-blur img-fade-in-slow"
              }`}
              style={{ ["--target-blur" as any]: "14px" }}
              aria-hidden="true"
            >
              <SmartImage
                src={currentFeaturedNews.image}
                alt={currentFeaturedNews.title}
                fill
                aspectRatio="16/9"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority={true}
                quality={75}
                className="w-full h-full"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent pointer-events-none" />

            {/* Loading overlay: fades in/out; never blocks clicks */}
            <div
              className={`absolute inset-0 z-30 flex items-center justify-center bg-white/50 dark:bg-black/35 backdrop-blur-sm transition-opacity duration-300 pointer-events-none ${
                isTransitioning ? "opacity-100" : "opacity-0"
              }`}
              aria-live="polite"
              aria-busy={isTransitioning}
              aria-label="Загрузка новости"
            >
              <span className="sr-only">Загрузка новости</span>
              <div className="w-10 h-10 rounded-full border-4 border-white/40 border-t-white/90 dark:border-white/30 dark:border-t-white animate-spin" />
            </div>

            {/* Transparent navigation buttons (always visible; no green outline) */}
            <div className="absolute inset-y-0 left-3 flex items-center z-40">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handlePrevNews()
                }}
                className="w-11 h-11 rounded-full bg-transparent hover:bg-white/10 active:bg-white/20 text-white flex items-center justify-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label="Предыдущая новость"
                title="Предыдущая новость"
              >
                <ChevronLeft className="w-5 h-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-3 flex items-center z-40">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleNextNews()
                }}
                className="w-11 h-11 rounded-full bg-transparent hover:bg-white/10 active:bg-white/20 text-white flex items-center justify-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label="Следующая новость"
                title="Следующая новость"
              >
                <ChevronRight className="w-5 h-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
              </button>
            </div>
          </div>

          {/* Text */}
          <div className="p-4 relative flex-1 min-h-[104px] flex flex-col">
            <div
              className={`flex items-center text-xs text-gray-500 mb-2 transition-opacity duration-300 ${
                isTransitioning ? "opacity-0" : "opacity-100"
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatRuDate(currentFeaturedNews.publishedAt)}</span>
            </div>

            <div className={`transition-opacity duration-600 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
              <h3
                className={`text-lg font-bold text-gray-900 mb-1 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors duration-200 ${
                  !isTransitioning ? "title-fade-in" : ""
                }`}
              >
                {currentFeaturedNews.title}
              </h3>
              <p
                className={`text-gray-600 text-sm leading-relaxed line-clamp-3 ${
                  !isTransitioning ? "body-fade-in" : ""
                }`}
              >
                {truncateText(currentFeaturedNews.excerpt, 111)}
              </p>
            </div>
          </div>

          {/* Indicators */}
          {allNews.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5">
              <div className="flex space-x-2">
                {allNews.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDotClick(index)
                    }}
                    className={`transition-all duration-200 ${
                      index === currentFeaturedIndex ? "w-8 h-2 bg-white rounded-full" : "w-2 h-2 bg-white/60 rounded-full"
                    }`}
                    aria-label={`Показать новость ${index + 1}`}
                  />
                ))}
              </div>

              <div className="relative w-20 h-1 bg-white/25 rounded-full overflow-hidden" aria-hidden="true">
                <div
                  key={`news-progress-${currentFeaturedIndex}`}
                  className="news-progress-fill h-full rounded-full"
                  style={{
                    animationDuration: "6000ms",
                    animationPlayState: isTransitioning ? "paused" : "running",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  )}

  {/* Right column: keep 1 big card on top, scroller for 10 items below (exact height of 2 former small cards) */}
  <div className="flex flex-col h-full">
    {topRightNews && (
      <Link href={`/news/${topRightNews.id}`}>
        <div className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer flex-1 mb-4 min-h-[223px]">
          <div className="h-full flex flex-col">
            <div className="relative h-32 overflow-hidden flex-shrink-0">
              <SmartImage
                src={topRightNews.image}
                alt={topRightNews.title}
                fill
                aspectRatio="16/9"
                sizes="(max-width: 1024px) 100vw, 400px"
                quality={75}
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between min-h-[91px]">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-base mb-0 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors duration-200">
                  {topRightNews.title}
                </h4>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed mt-2">{topRightNews.excerpt}</p>
              </div>
              <div className="flex items-center text-xs text-gray-500 flex-shrink-0">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{formatRuDate(topRightNews.publishedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )}

    <RightNewsScroller items={allNews} excludeId={topRightNews?.id} />
  </div>
</div>

{/* Mobile */}
<div className="lg:hidden space-y-4">
  {currentMobileNews && (
    <div className="relative overflow-hidden">
      <Link href={`/news/${currentMobileNews.id}`}>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-shadow duration-300 h-[205px] flex flex-col">
          <div className="relative h-32 overflow-hidden flex-shrink-0">
            <div
              key={`mobile-image-${mobileIndex}`}
              className={`absolute inset-0 will-change-transform transition-[filter,transform,opacity] duration-700 ease-out ${
                isMobileTransitioning ? "apply-blur" : "remove-blur img-fade-in"
              }`}
              style={{ ["--target-blur" as any]: "12px" }}
              aria-hidden="true"
            >
              <SmartImage
                src={currentMobileNews.image}
                alt={currentMobileNews.title}
                fill
                aspectRatio="16/9"
                sizes="(max-width: 768px) 100vw, 600px"
                quality={75}
                className="w-full h-full"
                priority={false}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

            {/* Loading overlay: fades in/out; never blocks clicks */}
            <div
              className={`absolute inset-0 z-20 flex items-center justify-center bg-white/45 dark:bg-black/30 backdrop-blur-sm transition-opacity duration-300 pointer-events-none ${
                isMobileTransitioning ? "opacity-100" : "opacity-0"
              }`}
              aria-live="polite"
              aria-busy={isMobileTransitioning}
              aria-label="Загрузка новости"
            >
              <span className="sr-only">Загрузка новости</span>
              <div className="w-7 h-7 rounded-full border-4 border-white/40 border-t-white/90 dark:border-white/30 dark:border-t-white animate-spin" />
            </div>

            {/* Transparent navigation buttons on mobile */}
            <div className="absolute inset-y-0 left-2 flex items-center z-30">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (allNews.length <= 1 || isMobileTransitioning) return
                  setIsMobileTransitioning(true)
                  setMobileIndex((prev) => (prev - 1 + allNews.length) % allNews.length)
                  setTimeout(() => setIsMobileTransitioning(false), MOBILE_TRANSITION_MS)
                }}
                className="w-9 h-9 rounded-full bg-transparent hover:bg-white/10 active:bg-white/20 text-white flex items-center justify-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label="Предыдущая новость"
                title="Предыдущая новость"
              >
                <ChevronLeft className="w-4 h-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-2 flex items-center z-30">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (allNews.length <= 1 || isMobileTransitioning) return
                  setIsMobileTransitioning(true)
                  setMobileIndex((prev) => (prev + 1) % allNews.length)
                  setTimeout(() => setIsMobileTransitioning(false), MOBILE_TRANSITION_MS)
                }}
                className="w-9 h-9 rounded-full bg-transparent hover:bg-white/10 active:bg-white/20 text-white flex items-center justify-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label="Следующая новость"
                title="Следующая новость"
              >
                <ChevronRight className="w-4 h-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
              </button>
            </div>

            {allNews.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                {allNews.map((_, index) => (
                  <div
                    key={index}
                    className={`${
                      index === mobileIndex ? "w-6 h-1.5 bg-white rounded-full" : "w-1.5 h-1.5 bg-white/60 rounded-full"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="p-4 flex-1 flex flex-col min-h-[73px]">
            <div className="flex items-center text-xs text-gray-500 mb-2 flex-shrink-0">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formatRuDate(currentMobileNews.publishedAt)}</span>
            </div>
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed flex-1 mt-0">
              {truncateText(currentMobileNews.excerpt, 111)}
            </p>
          </div>
        </div>
      </Link>
    </div>
  )}

  <div className="space-y-3">
    {recentNews.map((news) => (
      <Link key={news.id} href={`/news/${news.id}`}>
        <div className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer h-20">
          <div className="flex h-full">
            <div className="relative w-20 h-full flex-shrink-0 overflow-hidden">
              <SmartImage src={news.image} alt={news.title} width={120} height={80} quality={70} className="w-full h-full" />
              <div className="absolute inset-0 bg-black/20 transition-all duration-200 group-hover:bg-black/10" />
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-200 leading-tight">
                  {news.title}
                </h4>
              </div>
              <div className="flex items-center text-xs text-gray-500 flex-shrink-0">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{formatRuDate(news.publishedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    ))}
  </div>
</div>

<style jsx>{`
  @keyframes newsProgressGrow {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }
  .news-progress-fill {
    transform-origin: left center;
    transform: scaleX(0);
    animation-name: newsProgressGrow;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
    /* Uses login button gradient if present, else emerald→teal */
    background-image: var(--login-gradient, linear-gradient(90deg, #10b981, #14b8a6));
  }

  /* Image fade-in after loading */
  @keyframes imageFadeIn {
    0% {
      opacity: 0.15;
      transform: scale(1.04);
    }
    70% {
      opacity: 0.9;
      transform: scale(1.01);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  .img-fade-in {
    animation: imageFadeIn 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .img-fade-in-slow {
    animation: imageFadeIn 1100ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* Text fade-in after "loading" */
  @keyframes textFadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .title-fade-in {
    animation: textFadeIn 840ms ease-out 180ms both;
  }
  .body-fade-in {
    animation: textFadeIn 940ms ease-out 300ms both;
  }

  /* Smooth blur in/out */
  .apply-blur {
    filter: blur(var(--target-blur, 12px));
    transform: scale(1.05);
    opacity: 1;
  }
  .remove-blur {
    filter: blur(0px);
    transform: scale(1);
    opacity: 1;
  }
`}</style>
</section>
)
}
