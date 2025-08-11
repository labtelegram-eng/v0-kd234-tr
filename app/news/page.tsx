"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/layout/site-header"
import { LoginPanel } from "@/components/auth/login-panel"
import { SiteFooter } from "@/components/layout/site-footer"
import { NewsSearchFilter } from "@/components/news/news-search-filter"
import { NewsTimeline } from "@/components/news/news-timeline"
import { NewsSidebar } from "@/components/news/news-sidebar"
import { NewsLoading } from "@/components/news/news-loading"
import type { NewsItem, User } from "@/components/news/news-types"
import { OptimizedImage } from "@/components/image-optimizer"
import { getTimeAgo } from "@/components/news/news-utils"
import { Eye, TrendingUp } from "lucide-react"
import Link from "next/link"
import { NewsWidgetsContainer } from "@/components/news/news-widgets/news-widgets-container"
import { PartnerNotification } from "@/components/notifications/partner-notification"
import { useNotificationTimer } from "@/hooks/use-notification-timer"

export default function NewsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoginPanelOpen, setIsLoginPanelOpen] = useState(false)
  const [news, setNews] = useState<NewsItem[]>([])
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const { shouldShowNotification, closeNotification } = useNotificationTimer("news")

  useEffect(() => {
    checkAuth()
    fetchNews()
  }, [])

  useEffect(() => {
    filterNews()
  }, [news, selectedCategory, searchQuery])

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/news", { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        setNews(data.news || [])
      } else {
        setNews([])
      }
    } catch (error) {
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  const filterNews = () => {
    let filtered = news || []
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }
    setFilteredNews(filtered)
  }

  const handleLoginToggle = () => setIsLoginPanelOpen((v) => !v)
  const handleLoginPanelClose = () => setIsLoginPanelOpen(false)
  const handleLoginSuccess = (u: User) => {
    setUser(u)
    handleLoginPanelClose()
  }
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader
        user={user}
        onLoginToggle={handleLoginToggle}
        isLoginPanelOpen={isLoginPanelOpen}
        onLogout={handleLogout}
        onLoginPanelClose={handleLoginPanelClose}
      />

      <div
        className={`sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm transition-all duration-300 ease-in-out relative ${
          isLoginPanelOpen ? "md:mr-[400px]" : "md:mr-0"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/20 z-10 transition-opacity duration-300 hidden md:block ${
            isLoginPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={handleLoginPanelClose}
        />
        <div className="relative z-0">
          <NewsSearchFilter
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onSearchChange={setSearchQuery}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </div>

      <main
        className={`transition-all duration-300 ease-in-out relative ${isLoginPanelOpen ? "md:mr-[400px]" : "md:mr-0"}`}
      >
        <div
          className={`absolute inset-0 bg-black/20 z-10 transition-opacity duration-300 hidden md:block ${
            isLoginPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={handleLoginPanelClose}
        />

        <div className="relative z-0">
          <NewsWidgetsContainer />

          <div className="h-6 bg-gray-50" />

          <div className="block lg:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-2 p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-bold text-gray-900">Популярные новости</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {(filteredNews || []).slice(0, 3).map((newsItem) => {
                    return (
                      <Link key={newsItem.id} href={`/news/${newsItem.id}`}>
                        <article className="group block p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex gap-3">
                            <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                              <OptimizedImage
                                src={newsItem.image || "/placeholder.svg?height=90&width=120&query=news"}
                                alt={newsItem.title}
                                maxWidth={200}
                                maxHeight={150}
                                quality={0.9}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                                {newsItem.title}
                              </h4>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="font-medium">
                                  {/* @ts-expect-error - component util signature */}
                                  {getTimeAgo(newsItem.publishedAt || (newsItem as any).published_at)}
                                </span>
                                <div className="flex items-center gap-1 text-orange-600">
                                  <Eye className="w-3 h-3" />
                                  <span className="font-medium">{Math.floor(Math.random() * 200) + 50}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <section className="pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {loading ? (
                <NewsLoading />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <NewsTimeline filteredNews={filteredNews || []} onResetFilters={handleResetFilters} />
                  </div>
                  <div className="hidden lg:block">
                    <NewsSidebar
                      filteredNews={filteredNews || []}
                      allNews={news || []}
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />

      <LoginPanel isOpen={isLoginPanelOpen} onClose={handleLoginPanelClose} onUserChange={handleLoginSuccess} />

      <PartnerNotification page="news" isVisible={shouldShowNotification} onClose={closeNotification} />
    </div>
  )
}
