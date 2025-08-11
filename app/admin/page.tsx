"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from 'lucide-react'
import SiteHeader from "@/components/layout/site-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DashboardSection } from "@/components/admin/dashboard-section"
import { DestinationsSection } from "@/components/admin/destinations-section"
import { HomepageSection } from "@/components/admin/homepage-section"
import { MusicSection } from "@/components/admin/music-section"
import { NewsSection } from "@/components/admin/news-section"
import { NewsWidgetsSection } from "@/components/admin/news-widgets-section"
import { BlogSection } from "@/components/admin/blog-section"
import { DatabaseSection } from "@/components/admin/database-section"
import { WriteSection } from "@/components/admin/write-section"

interface AdminUser {
  id: number
  username: string
  role?: string
}

interface Destination {
  id: number
  name: string
  image: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminPage() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [musicTracks, setMusicTracks] = useState<any[]>([])
  const [newsCount, setNewsCount] = useState(0)
  const [blogsCount, setBlogsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeSection, setActiveSection] = useState("dashboard")
  const [isUploading, setIsUploading] = useState(false)

  // Partner notifications embed loading control
  const [partnerEmbedLoaded, setPartnerEmbedLoaded] = useState(false)
  const [partnerEmbedMinDelayDone, setPartnerEmbedMinDelayDone] = useState(false)
  const partnerMinDelayTimer = useRef<number | null>(null)
  const partnerSrc = "/admin/partner-notifications?embed=1"
  const partnerOverlayVisible = activeSection === "partner-notifications" && !(partnerEmbedLoaded && partnerEmbedMinDelayDone)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user?.role === "admin") {
      loadAllData()
    }
  }, [user])

  useEffect(() => {
    if (user?.role === "admin") {
      if (activeSection === "destinations") {
        loadDestinations()
      } else if (activeSection === "music") {
        loadMusicTracks()
      } else if (activeSection === "news") {
        loadNewsCount()
      } else if (activeSection === "blogs") {
        loadBlogsCount()
      }
    }
  }, [user, activeSection])

  // Reset 5s minimum loading timer and load state when switching to partner-notifications
  useEffect(() => {
    if (activeSection === "partner-notifications") {
      setPartnerEmbedLoaded(false)
      setPartnerEmbedMinDelayDone(false)

      if (partnerMinDelayTimer.current) {
        window.clearTimeout(partnerMinDelayTimer.current)
        partnerMinDelayTimer.current = null
      }

      partnerMinDelayTimer.current = window.setTimeout(() => {
        setPartnerEmbedMinDelayDone(true)
        partnerMinDelayTimer.current = null
      }, 5000)
    }

    // Cleanup when leaving section or unmounting
    return () => {
      if (partnerMinDelayTimer.current) {
        window.clearTimeout(partnerMinDelayTimer.current)
        partnerMinDelayTimer.current = null
      }
    }
  }, [activeSection])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        if (data.user.role !== "admin") {
          setError("У вас нет прав доступа к админ панели")
        }
      } else {
        setError("Необходимо войти в систему")
      }
    } catch (error) {
      setError("Ошибка проверки авторизации")
    } finally {
      setIsLoading(false)
    }
  }

  const loadDestinations = async () => {
    try {
      const response = await fetch("/api/destinations")
      if (response.ok) {
        const data = await response.json()
        setDestinations(data.destinations || [])
      }
    } catch (error) {
      setError("Ошибка загрузки направлений")
    }
  }

  const loadMusicTracks = async () => {
    try {
      const response = await fetch("/api/music-tracks")
      if (response.ok) {
        const data = await response.json()
        setMusicTracks(data.tracks || [])
      }
    } catch (error) {
      setError("Ошибка загрузки музыкальных треков")
    }
  }

  const loadNewsCount = async () => {
    try {
      const response = await fetch("/api/news")
      if (response.ok) {
        const data = await response.json()
        setNewsCount(data.news?.length || 0)
      }
    } catch (error) {
      setError("Ошибка загрузки новостей")
    }
  }

  const loadBlogsCount = async () => {
    try {
      const response = await fetch("/api/blog/posts")
      if (response.ok) {
        const data = await response.json()
        setBlogsCount(data.posts?.length || 0)
      }
    } catch (error) {
      setError("Ошибка загрузки блогов")
    }
  }

  const loadAllData = async () => {
    await Promise.all([loadDestinations(), loadMusicTracks(), loadNewsCount(), loadBlogsCount()])
  }

  const handleFileUpload = async (file: File): Promise<string | null> => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        return data.imagePath
      } else {
        const data = await response.json()
        setError(data.error)
        return null
      }
    } catch (error) {
      setError("Ошибка загрузки файла")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const dashboardStats = {
    destinations: destinations.length,
    musicTracks: musicTracks.length,
    blogs: blogsCount,
    news: newsCount,
  }

  const renderSection = () => {
    switch (activeSection) {
      case "write":
        return <WriteSection />
      case "dashboard":
        return <DashboardSection stats={dashboardStats} onSectionChange={setActiveSection} />
      case "destinations":
        return (
          <DestinationsSection
            destinations={destinations}
            onUpdate={loadDestinations}
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
            error={error}
            setError={setError}
          />
        )
      case "homepage":
        return <HomepageSection onFileUpload={handleFileUpload} isUploading={isUploading} error={error} setError={setError} />
      case "music":
        return (
          <MusicSection
            onUpdate={loadMusicTracks}
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
            error={error}
            setError={setError}
          />
        )
      case "news":
        return (
          <NewsSection
            onUpdate={loadNewsCount}
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
            error={error}
            setError={setError}
          />
        )
      case "news-widgets":
        return (
          <NewsWidgetsSection
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
            error={error}
            setError={setError}
          />
        )
      case "blogs":
        return (
          <BlogSection
            onUpdate={loadBlogsCount}
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
            error={error}
            setError={setError}
          />
        )
      case "partner-notifications":
        return (
          <section className="relative h-[calc(100vh-7rem)] -mt-2">
            {/* Blocking overlay over the content while loading (min 5s) */}
            {partnerOverlayVisible && (
              <div
                className="absolute inset-0 z-20 flex items-center justify-center"
                aria-live="polite"
                aria-busy="true"
              >
                {/* Keep the original admin background visible under the overlay */}
                <div className="absolute inset-0" />
                <div className="relative flex flex-col items-center gap-2 text-gray-700">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm">{"Загрузка интерфейса…"}</span>
                </div>
              </div>
            )}

            {/* Iframe stays hidden until overlay is gone to avoid black screen */}
            <iframe
              src={partnerSrc}
              title="Партнерские уведомления"
              className={`w-full h-full rounded-lg border border-gray-200 bg-white transition-opacity duration-300 ${
                partnerOverlayVisible ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setPartnerEmbedLoaded(true)}
            />
          </section>
        )
      case "database":
        return <DatabaseSection />
      default:
        return <DashboardSection stats={dashboardStats} onSectionChange={setActiveSection} />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Доступ запрещен</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <SiteHeader
        user={user}
        onLoginToggle={() => {}}
        isLoginPanelOpen={false}
        onLogout={handleLogout}
        onLoginPanelClose={() => {}}
      />

      {/* Глобальный фоновый градиент */}
      <div className="fixed inset-0 top-16 bg-gradient-to-br from-purple-500/3 via-blue-500/2 to-violet-500/3 pointer-events-none z-0"></div>

      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="ml-64 pt-4 p-6 relative z-10">{renderSection()}</main>
    </div>
  )
}
