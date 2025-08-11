"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { SiteHeader } from "@/components/layout/site-header"
import { LoginPanel } from "@/components/auth/login-panel"
import { SiteFooter } from "@/components/layout/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import { OptimizedImage } from "@/components/image-optimizer"
import PartnerNotification from "@/components/notifications/partner-notification"

interface NewsItem {
  id: number
  title: string
  excerpt: string
  content: string
  image: string
  published_at: string
  is_active: boolean
  is_featured: boolean
  category: string
  created_at: string
  updated_at: string
}
interface User {
  id: number
  username: string
  role?: string
}

const NEWS_CATEGORIES = [
  { id: "tourism", name: "Туризм", color: "bg-blue-100 text-blue-800" },
  { id: "culture", name: "Культура", color: "bg-purple-100 text-purple-800" },
  { id: "food", name: "Еда", color: "bg-green-100 text-green-800" },
  { id: "events", name: "События", color: "bg-orange-100 text-orange-800" },
  { id: "transport", name: "Транспорт", color: "bg-indigo-100 text-indigo-800" },
]

export default function NewsDetailPage() {
  const params = useParams()
  const newsId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [isLoginPanelOpen, setIsLoginPanelOpen] = useState(false)
  const [news, setNews] = useState<NewsItem | null>(null)
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([])
  const [allNews, setAllNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoginPanelTransitioning, setIsLoginPanelTransitioning] = useState(false)
  const [showNotification, setShowNotification] = useState(true)
  const [timeAgo, setTimeAgo] = useState<string>("")

  useEffect(() => {
    // auth
    ;(async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      }
    })()
    void fetchNews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newsId])

  useEffect(() => {
    if (!news?.published_at) return
    const update = () => setTimeAgo(getTimeAgo(news.published_at))
    update()
    const interval = setInterval(update, 60 * 1000)
    return () => clearInterval(interval)
  }, [news?.published_at])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/news")
      if (response.ok) {
        const data = await response.json()
        const all = (data.news || []).map((item: any) => ({
          ...item,
          category: getRandomCategory(),
        }))
        setAllNews(all)
        const currentNews = all.find((item: any) => item.id === Number.parseInt(newsId))
        if (currentNews) {
          setNews(currentNews)
          const related = all
            .filter((item: any) => item.id !== currentNews.id && item.category === currentNews.category)
            .slice(0, 3)
          setRelatedNews(related)
        }
      }
    } catch (e) {
      console.error("Error fetching news:", e)
    } finally {
      setLoading(false)
    }
  }

  const getRandomCategory = () => {
    const categories = ["tourism", "culture", "food", "events", "transport"]
    return categories[Math.floor(Math.random() * categories.length)]
  }

  const handleLoginToggle = () => {
    if (isLoginPanelOpen) {
      setIsLoginPanelTransitioning(true)
      setTimeout(() => {
        setIsLoginPanelOpen(false)
        setIsLoginPanelTransitioning(false)
      }, 300)
    } else {
      setIsLoginPanelOpen(true)
    }
  }

  const handleLoginPanelClose = () => {
    setIsLoginPanelTransitioning(true)
    setTimeout(() => {
      setIsLoginPanelOpen(false)
      setIsLoginPanelTransitioning(false)
    }, 300)
  }

  const handleLoginSuccess = (userData: User) => {
    setUser(userData)
    handleLoginPanelClose()
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
    } catch (e) {
      console.error(e)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 24) {
      return `${diffInHours} ч. назад`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} дн. назад`
    }
  }

  const getCategoryInfo = (categoryId: string) => {
    return NEWS_CATEGORIES.find((cat) => cat.id === categoryId) || NEWS_CATEGORIES[0]
  }

  const handleShare = async () => {
    if (navigator.share && news) {
      try {
        await navigator.share({ title: news.title, text: news.excerpt, url: window.location.href })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert("Ссылка скопирована в буфер обмена!")
    }
  }

  const categoryInfo = useMemo(() => (news ? getCategoryInfo(news.category) : null), [news])
  const otherNews = useMemo(() => {
    if (!news) return []
    return allNews.filter((n) => n.id !== news.id).slice(0, 6)
  }, [allNews, news])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className={`transition-all duration-300 ease-in-out ${isLoginPanelOpen ? "mr-80 lg:mr-96" : "mr-0"}`}>
          <SiteHeader
            user={user}
            onLoginToggle={handleLoginToggle}
            isLoginPanelOpen={isLoginPanelOpen}
            onLogout={handleLogout}
            onLoginPanelClose={handleLoginPanelClose}
          />
          <main className="py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
                <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
                <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className={`transition-all duration-300 ease-in-out ${isLoginPanelOpen ? "mr-80 lg:mr-96" : "mr-0"}`}>
          <SiteHeader
            user={user}
            onLoginToggle={handleLoginToggle}
            isLoginPanelOpen={isLoginPanelOpen}
            onLogout={handleLogout}
            onLoginPanelClose={handleLoginPanelClose}
          />
          <main className="py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Новость не найдена</h1>
              <Link href="/news">
                <Button>Вернуться к новостям</Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`transition-all duration-300 ease-in-out ${isLoginPanelOpen ? "mr-80 lg:mr-96" : "mr-0"}`}>
        <SiteHeader
          user={user}
          onLoginToggle={handleLoginToggle}
          isLoginPanelOpen={isLoginPanelOpen}
          onLogout={handleLogout}
          onLoginPanelClose={handleLoginPanelClose}
        />
        <main className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/news"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-all duration-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Все новости
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 rounded-xl px-4 py-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Поделиться</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="space-y-0">
                  <section className="relative mb-0 rounded-t-2xl rounded-b-none overflow-hidden shadow-none">
                    <div className="relative h-60 sm:h-72 lg:h-80 bg-black">
                      <OptimizedImage
                        src={news.image || "/placeholder.svg"}
                        alt={news.title}
                        maxWidth={1200}
                        maxHeight={640}
                        quality={0.95}
                        priority={true}
                        className="w-full h-full object-contain"
                        style={{ objectFit: "contain", objectPosition: "center" }}
                      />
                      {categoryInfo && (
                        <Badge
                          className={`absolute top-4 left-4 ${categoryInfo.color} border-0 shadow-lg backdrop-blur-sm`}
                        >
                          {categoryInfo.name}
                        </Badge>
                      )}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-28 bg-gradient-to-t from-black/80 via-black/60 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                        <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight drop-shadow-md">
                          {news.title}
                        </h1>
                      </div>
                    </div>
                  </section>

                  <section className="relative z-10 -mt-px">
                    <div className="relative rounded-t-none rounded-b-2xl bg-black text-white px-5 py-4 sm:px-6 sm:py-5 shadow-none border-0 before:content-[''] before:absolute before:left-0 before:right-0 before:-top-px before:h-px before:bg-black">
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="inline-flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-white/80" />
                          <span className="font-medium text-white">Опубликовано:</span>
                          <span className="text-white/90">{formatDate(news.published_at)}</span>
                        </div>
                        <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-white/30" />
                        <div className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4 text-white/80" />
                          <span className="text-white/90">{timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="mt-8 space-y-8">
                  <article className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border-0">
                    <div className="p-8 sm:p-10">
                      <div className="relative">
                        <div className="absolute -top-4 left-0 w-20 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
                        <div className="prose prose-lg max-w-none">
                          <p className="text-xl text-gray-700 font-medium mb-8 leading-relaxed border-l-4 border-gradient-to-b from-blue-500 to-purple-500 pl-6 bg-gray-50 rounded-r-xl py-4">
                            {news.excerpt}
                          </p>
                          <div className="text-gray-700 leading-relaxed space-y-6 text-base">
                            {String(news.content)
                              .split("\n\n")
                              .map((paragraph, index) => (
                                <p key={index} className="mb-4">
                                  {paragraph}
                                </p>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>

                  {relatedNews.length > 0 && (
                    <section>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8 text-center">
                        Похожие новости
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedNews.map((relatedItem) => {
                          const relatedCategoryInfo = getCategoryInfo(relatedItem.category)
                          return (
                            <Link key={relatedItem.id} href={`/news/${relatedItem.id}`}>
                              <Card className="group cursor-pointer overflow-hidden transition-all duration-500 transform hover:-translate-y-1 hover:shadow-xl h-full bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-purple-200/50">
                                <div className="relative h-48 overflow-hidden">
                                  <OptimizedImage
                                    src={relatedItem.image || "/placeholder.svg"}
                                    alt={relatedItem.title}
                                    maxWidth={300}
                                    maxHeight={200}
                                    quality={0.9}
                                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                  <Badge
                                    className={`absolute top-3 left-3 ${relatedCategoryInfo.color} border-0 text-xs shadow-lg backdrop-blur-sm`}
                                  >
                                    {relatedCategoryInfo.name}
                                  </Badge>
                                </div>
                                <CardContent className="p-5">
                                  <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                                    {relatedItem.title}
                                  </h3>
                                  <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                                    {relatedItem.excerpt}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center text-xs text-gray-500">
                                      <Clock className="h-3 w-3 mr-1" />
                                      <span>{getTimeAgo(relatedItem.published_at)}</span>
                                    </div>
                                    <div className="text-xs text-blue-600 group-hover:text-purple-600 transition-colors duration-300 font-medium">
                                      Читать →
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          )
                        })}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              <aside className="hidden lg:block lg:col-span-1">
                <div className="lg:sticky lg:top-24 space-y-6">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900">Подборка новостей</h3>
                      <p className="text-xs text-gray-500 mt-1">Интересное к прочтению</p>
                    </div>
                    <div className="p-4">
                      {otherNews.length === 0 && <div className="text-sm text-gray-500">Нет других новостей</div>}
                      <div className="space-y-4">
                        {otherNews.map((item) => {
                          const catInfo = getCategoryInfo(item.category)
                          return (
                            <Link key={item.id} href={`/news/${item.id}`}>
                              <article className="group flex items-center gap-3 cursor-pointer">
                                <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  <OptimizedImage
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.title}
                                    maxWidth={200}
                                    maxHeight={120}
                                    quality={0.9}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                  <Badge
                                    className={`absolute bottom-1 left-1 text-[10px] px-1.5 py-0 ${catInfo.color} border-0`}
                                  >
                                    {catInfo.name}
                                  </Badge>
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {item.title}
                                  </h4>
                                  <div className="mt-1 text-xs text-gray-500 inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{getTimeAgo(item.published_at)}</span>
                                  </div>
                                </div>
                              </article>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl overflow-hidden shadow-xl border-0 bg-gradient-to-br from-purple-600 to-blue-600 text-white p-6">
                    <h3 className="text-lg font-bold mb-2">Тайская подборка</h3>
                    <p className="text-sm text-white/90 mb-4">Ещё больше путешествий и идей для отдыха.</p>
                    <Link
                      href="/news"
                      className="inline-block bg-white text-purple-700 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
                    >
                      Открыть ленту
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>

      <LoginPanel
        isOpen={isLoginPanelOpen || isLoginPanelTransitioning}
        onClose={handleLoginPanelClose}
        onUserChange={setUser}
      />

      {(isLoginPanelOpen || isLoginPanelTransitioning) && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={handleLoginPanelClose}
        />
      )}

      <PartnerNotification
        page="news"
        currentItemId={Number(newsId)}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  )
}
