"use client"

import { Eye, ArrowUpDown, ExternalLink, TrendingUp } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { OptimizedImage } from "@/components/image-optimizer"
import { getTimeAgo, getCategoryInfo } from "./news-utils"
import { NEWS_CATEGORIES } from "./news-constants"
import type { NewsItem } from "./news-types"
import { useState } from "react"

interface NewsSidebarProps {
  filteredNews: NewsItem[]
  allNews: NewsItem[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function NewsSidebar({ filteredNews, allNews, selectedCategory, onCategoryChange }: NewsSidebarProps) {
  return (
    <>
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }

        @keyframes bubble-float-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate(10px, -15px) scale(1.2);
            opacity: 0.6;
          }
          50% {
            transform: translate(-5px, -25px) scale(0.8);
            opacity: 0.2;
          }
          75% {
            transform: translate(15px, -10px) scale(1.1);
            opacity: 0.5;
          }
        }

        @keyframes bubble-float-2 {
          0%, 100% {
            transform: translate(0, 0) scale(0.8);
            opacity: 0.2;
          }
          30% {
            transform: translate(-12px, 20px) scale(1.3);
            opacity: 0.7;
          }
          60% {
            transform: translate(8px, 10px) scale(0.6);
            opacity: 0.1;
          }
          90% {
            transform: translate(-8px, 5px) scale(1);
            opacity: 0.4;
          }
        }

        @keyframes bubble-float-3 {
          0%, 100% {
            transform: translate(0, 0) scale(1.1);
            opacity: 0.4;
          }
          20% {
            transform: translate(8px, -12px) scale(0.7);
            opacity: 0.1;
          }
          40% {
            transform: translate(-15px, -8px) scale(1.4);
            opacity: 0.8;
          }
          80% {
            transform: translate(12px, 15px) scale(0.9);
            opacity: 0.3;
          }
        }

        @keyframes bubble-float-4 {
          0%, 100% {
            transform: translate(0, 0) scale(0.9);
            opacity: 0.3;
          }
          35% {
            transform: translate(-10px, -18px) scale(1.2);
            opacity: 0.6;
          }
          70% {
            transform: translate(18px, -5px) scale(0.5);
            opacity: 0.1;
          }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }

        .bubble-1 {
          animation: bubble-float-1 6s ease-in-out infinite;
        }

        .bubble-2 {
          animation: bubble-float-2 8s ease-in-out infinite;
        }

        .bubble-3 {
          animation: bubble-float-3 7s ease-in-out infinite;
        }

        .bubble-4 {
          animation: bubble-float-4 5s ease-in-out infinite;
        }
      `}</style>
      
      <div className="space-y-6">
        {/* Popular News */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Популярные новости</h3>
          </div>
          <div className="p-4">
            {filteredNews.slice(0, 4).map((newsItem, index) => {
              const categoryInfo = getCategoryInfo(newsItem.category)
              const isLast = index === filteredNews.slice(0, 4).length - 1
              return (
                <div key={newsItem.id}>
                  <Link href={`/news/${newsItem.id}`}>
                    <article className="group block py-4">
                      <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                        <OptimizedImage
                          src={newsItem.image || "/placeholder.svg"}
                          alt={newsItem.title}
                          maxWidth={300}
                          maxHeight={200}
                          quality={0.9}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <Badge
                          className={`absolute top-2 left-2 ${categoryInfo.color} border-0 text-xs px-2 py-1 rounded-full shadow-sm font-medium`}
                        >
                          {categoryInfo.name}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                        {newsItem.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{getTimeAgo(newsItem.publishedAt)}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{Math.floor(Math.random() * 200) + 20}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                  {!isLast && <div className="border-b border-gray-100"></div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Категории</h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {NEWS_CATEGORIES.slice(1).map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {category.name}
                  <span className="float-right text-xs text-gray-400">
                    {allNews.filter((item) => item.category === category.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Currency Exchange Block */}
        <div className="relative bg-gradient-to-br from-emerald-200 via-green-100 to-teal-300 rounded-2xl shadow-lg border border-emerald-200 overflow-hidden transition-all duration-300 animate-gradient-x">
          {/* Animated Bubbles */}
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-300/20 rounded-full bubble-1"></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-teal-300/15 rounded-full bubble-2"></div>
          <div className="absolute top-4 -left-6 w-12 h-12 bg-green-200/25 rounded-full bubble-3"></div>
          <div className="absolute -top-4 left-1/2 w-8 h-8 bg-emerald-400/20 rounded-full bubble-4"></div>
          <div className="absolute bottom-8 -right-6 w-14 h-14 bg-teal-200/30 rounded-full bubble-1"></div>
          <div className="absolute top-1/2 -right-4 w-10 h-10 bg-green-300/15 rounded-full bubble-3"></div>
          <div className="absolute -bottom-6 left-8 w-18 h-18 bg-emerald-200/25 rounded-full bubble-2"></div>
          <div className="absolute top-6 right-4 w-6 h-6 bg-teal-400/20 rounded-full bubble-4"></div>
          
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-emerald-800 mb-1">Senate Exchange</h3>
                <p className="text-emerald-600 text-sm">
                  <span className="text-red-600 font-medium">Легальный</span> обмен валют
                </p>
              </div>
              <div className="bg-emerald-200/50 rounded-full p-3 transition-colors">
                <ArrowUpDown className="w-6 h-6 text-emerald-700" />
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-4 border border-emerald-200/50">
              <div className="text-center mb-3">
                <div className="text-2xl font-bold text-emerald-800 mb-1">1 THB = 2.85 ₽</div>
                <div className="text-emerald-600 text-sm">Выгодный курс</div>
              </div>
              <div className="flex justify-between text-xs text-emerald-700">
                <span>• Без комиссий</span>
                <span>• За 5-15 минут</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Работаем с 2019 года</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>50,000+ довольных клиентов</span>
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation()
                window.open('https://senateexchange.org/', '_blank')
              }}
              className="w-full bg-emerald-200/50 rounded-lg px-4 py-3 text-center font-semibold text-emerald-800 hover:bg-emerald-300/70 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              Обменять на сайте
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl text-white p-6 overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-4">Статистика</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Всего новостей</span>
                <span className="font-bold text-xl">{allNews.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Сегодня</span>
                <span className="font-bold text-xl">{Math.floor(allNews.length * 0.3)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Популярных</span>
                <span className="font-bold text-xl">{allNews.filter((item) => item.isFeatured).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
