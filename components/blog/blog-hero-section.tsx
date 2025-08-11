"use client"

import { useRef, useEffect } from "react"

interface BlogHeroSectionProps {
  onStickyChange?: (isSticky: boolean) => void
}

export function BlogHeroSection({ onStickyChange }: BlogHeroSectionProps) {
  const heroRef = useRef<HTMLElement>(null)

  // Отслеживаем sticky состояние для внешних компонентов
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current && onStickyChange) {
        const heroRect = heroRef.current.getBoundingClientRect()
        const heroBottom = heroRect.bottom
        onStickyChange(heroBottom <= 80) // 80px - высота sticky поиска
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [onStickyChange])

  return (
    <section ref={heroRef} className="relative h-96 sm:h-[500px] md:h-[600px] overflow-hidden z-10">
      {/* Background Image with Ultra Slow Zoom Animation */}
      <div className="absolute inset-0 hero-zoom-background">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat hero-zoom-image"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/photo/thailand-coastline.jpg')`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white px-4 max-w-4xl mx-auto mb-20 sm:mb-24 md:mb-28 lg:mb-32">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            Добро пожаловать в блог о Таиланде
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
            читайте статьи, вдохновляйтесь историями и открывайте новые грани Страны Улыбок.
          </p>
        </div>
      </div>

      {/* Decorative overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent" />

      <style jsx>{`
        @keyframes heroZoom {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
          }
        }

        .hero-zoom-image {
          animation: heroZoom 40s ease-in-out infinite;
          transform-origin: center center;
        }

        .hero-zoom-background {
          overflow: hidden;
        }
      `}</style>
    </section>
  )
}
