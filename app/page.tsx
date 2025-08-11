"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/layout/site-header"
import { LoginPanel } from "@/components/auth/login-panel"
import { HeroCarousel } from "@/components/sections/hero-carousel"
import { HeroContent } from "@/components/sections/hero-content"
import { DestinationsSection } from "@/components/sections/destinations-section"
import { MusicSection } from "@/components/sections/music-section"
import { CultureVideoSection } from "@/components/sections/culture-video-section"
import { NewsSection } from "@/components/sections/news-section"
import { BlogsSection } from "@/components/sections/blogs-section"
import { SiteFooter } from "@/components/layout/site-footer"
import { VideoPlayer } from "@/components/media/video-player"
import { PartnerNotification } from "@/components/notifications/partner-notification"
import { useNotificationTimer } from "@/hooks/use-notification-timer"
import PlanningModal from "@/components/planning/planning-modal"
import { SuggestionsShortcuts } from "@/components/sections/suggestions-shortcuts"

interface SiteUser {
  id: number
  username: string
  role?: string
}

export default function HomePage() {
  const [user, setUser] = useState<SiteUser | null>(null)
  const [isLoginPanelOpen, setIsLoginPanelOpen] = useState(false)
  const [videoPlayer, setVideoPlayer] = useState<any>(null)

  // Planning modal state
  const [isPlanningOpen, setIsPlanningOpen] = useState(false)
  const [planningOrigin, setPlanningOrigin] = useState<{ x: number; y: number } | null>(null)

  // Partner notification
  const { shouldShowNotification, closeNotification } = useNotificationTimer("home")

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Ошибка проверки авторизации:", error)
      }
    }
    checkAuth()
  }, [])

  const handleLoginToggle = () => setIsLoginPanelOpen(!isLoginPanelOpen)
  const handleLoginPanelClose = () => setIsLoginPanelOpen(false)
  const handleUserChange = (newUser: SiteUser | null) => setUser(newUser)

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
    } catch (error) {
      console.error("Ошибка выхода:", error)
    }
  }

  const openVideoPlayer = (video: any) => {
    setVideoPlayer({
      isOpen: true,
      currentVideo: video,
      position: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 200 },
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
    })
  }
  const closeVideoPlayer = () => setVideoPlayer(null)

  // Open Planning Modal from the original hero button; compute the click origin for reveal animation
  const handleStartPlanning = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPlanningOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    setIsPlanningOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
       @keyframes spin-fast {
         0% {
           transform: rotateY(0deg);
         }
         100% {
           transform: rotateY(360deg);
         }
       }
       .animate-spin-fast {
         animation: spin-fast 0.7s ease-in-out;
       }
     `}</style>

      {/* Site header */}
      <SiteHeader
        user={user}
        onLoginToggle={handleLoginToggle}
        isLoginPanelOpen={isLoginPanelOpen}
        onLogout={handleLogout}
        onLoginPanelClose={handleLoginPanelClose}
      />

      {/* Main content */}
      <main
        className={`
         transition-all duration-300 ease-in-out relative
         ${isLoginPanelOpen ? "md:mr-[400px]" : "md:mr-0"}
       `}
      >
        {/* Overlay for login side panel */}
        <div
          className={`
           absolute inset-0 bg-black/20 z-10 transition-opacity duration-300 hidden md:block
           ${isLoginPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
         `}
          onClick={handleLoginPanelClose}
        />

        {/* Page content */}
        <div className="relative z-0">
          {/* Hero Section */}
          <section className="relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
              <div className="relative">
                <HeroCarousel />
                {/* Use the original hero button; call planning modal on click */}
                <HeroContent onStartPlanning={handleStartPlanning} />
              </div>
            </div>
          </section>

          <DestinationsSection />
          <NewsSection />
          <MusicSection onVideoPlay={openVideoPlayer} />
          <CultureVideoSection />
          <BlogsSection />
          <SuggestionsShortcuts />
          <SiteFooter />
        </div>
      </main>

      {/* Login Panel */}
      <LoginPanel isOpen={isLoginPanelOpen} onClose={handleLoginPanelClose} onUserChange={handleUserChange} />

      {/* Video Player */}
      {videoPlayer?.isOpen && (
        <VideoPlayer videoPlayer={videoPlayer} onClose={closeVideoPlayer} onUpdate={setVideoPlayer} />
      )}

      {/* Planning Modal connected to the original hero button */}
      <PlanningModal open={isPlanningOpen} origin={planningOrigin} onClose={() => setIsPlanningOpen(false)} />

      {/* Partner Notification */}
      <PartnerNotification page="home" isVisible={shouldShowNotification} onClose={closeNotification} />
    </div>
  )
}
