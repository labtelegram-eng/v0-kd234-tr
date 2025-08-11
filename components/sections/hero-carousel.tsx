"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"

interface HeroSlide {
  id: number
  image: string
  alt: string
  order: number
  isActive: boolean
}

interface HomePageSettings {
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  slides: HeroSlide[]
}

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [homeSettings, setHomeSettings] = useState<HomePageSettings>({
    heroTitle: "Откройте для себя чудеса Таиланда",
    heroSubtitle:
      "Откройте для себя красоту, культуру и приключения, которые ждут вас в Стране Улыбок. Спланируйте свое идеальное путешествие с нашим подробным гидом.",
    heroButtonText: "Начать планирование",
    slides: [],
  })

  // Загрузка настроек главной страницы
  useEffect(() => {
    const loadHomeSettings = async () => {
      try {
        const response = await fetch("/api/home-settings")
        if (response.ok) {
          const data = await response.json()
          const incoming = data?.settings ?? {}
          const incomingSlides = (data?.settings?.slides ?? data?.slides ?? []) as any[]

          setHomeSettings((prev) => ({
            ...prev,
            heroTitle: incoming.heroTitle ?? prev.heroTitle,
            heroSubtitle: incoming.heroSubtitle ?? prev.heroSubtitle,
            heroButtonText: incoming.heroButtonText ?? prev.heroButtonText,
            slides: Array.isArray(incomingSlides)
              ? incomingSlides.map((s: any) => ({
                  id: s.id,
                  image: s.image,
                  alt: s.alt ?? "",
                  order: typeof s.order === "number" ? s.order : 0,
                  isActive: Boolean(s.isActive ?? s.is_active ?? true),
                }))
              : [],
          }))
        }
      } catch (error) {
        console.error("Load home settings error:", error)
      }
    }
    loadHomeSettings()
  }, [])

  // Получаем активные слайды
  const slides = Array.isArray(homeSettings.slides) ? homeSettings.slides : []
  const activeSlides = slides.filter((slide) => slide.isActive).sort((a, b) => a.order - b.order)

  // Функция для перехода к следующему слайду
  const nextSlide = useCallback(() => {
    if (activeSlides.length === 0 || isTransitioning) return

    setIsTransitioning(true)
    setCurrentSlide((prev) => {
      const nextIndex = prev + 1
      return nextIndex >= activeSlides.length ? 0 : nextIndex
    })

    // Время для плавного перехода слайдов
    setTimeout(() => setIsTransitioning(false), 2500)
  }, [activeSlides.length, isTransitioning])

  // Функция для перехода к предыдущему слайду
  const prevSlide = useCallback(() => {
    if (activeSlides.length === 0 || isTransitioning) return

    setIsTransitioning(true)
    setCurrentSlide((prev) => {
      const prevIndex = prev - 1
      return prevIndex < 0 ? activeSlides.length - 1 : prevIndex
    })

    setTimeout(() => setIsTransitioning(false), 2500)
  }, [activeSlides.length, isTransitioning])

  // Auto-play functionality
  useEffect(() => {
    if (activeSlides.length === 0 || !isAutoPlaying) return

    const timer = setInterval(() => {
      nextSlide()
    }, 8000)

    return () => clearInterval(timer)
  }, [activeSlides.length, isAutoPlaying, nextSlide])

  const goToSlide = (index: number) => {
    if (index === currentSlide || isTransitioning) return

    setIsTransitioning(true)
    setCurrentSlide(index)
    setTimeout(() => setIsTransitioning(false), 2500)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  // Если нет активных слайдов, показываем заглушку
  if (activeSlides.length === 0) {
    return (
      <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 md:h-96 bg-gradient-to-r from-blue-500 to-purple-600">
        {/* Пустой фон без контента - контент будет в HeroContent */}
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 md:h-96 group">
      <style jsx>{`
        @keyframes cameraZoomIn {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 0;
            filter: blur(2px);
          }
          20% {
            opacity: 0.3;
            filter: blur(1px);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05) rotate(0.2deg);
            filter: blur(0.5px);
          }
          100% {
            transform: scale(1.1) rotate(0deg);
            opacity: 1;
            filter: blur(0px);
          }
        }

        @keyframes cameraZoomOut {
          0% {
            transform: scale(1.1) rotate(0deg);
            opacity: 1;
            filter: blur(0px);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05) rotate(-0.2deg);
            filter: blur(0.5px);
          }
          80% {
            opacity: 0.3;
            filter: blur(1px);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 0;
            filter: blur(2px);
          }
        }

        @keyframes slowZoomPan {
          0% {
            transform: scale(1.1) translateX(0) translateY(0);
          }
          25% {
            transform: scale(1.12) translateX(-1%) translateY(-0.5%);
          }
          50% {
            transform: scale(1.15) translateX(0.5%) translateY(-1%);
          }
          75% {
            transform: scale(1.13) translateX(-0.5%) translateY(0.5%);
          }
          100% {
            transform: scale(1.1) translateX(0) translateY(0);
          }
        }

        .slide-active {
          animation: cameraZoomIn 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .slide-inactive {
          animation: cameraZoomOut 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .slide-bg-active {
          animation: slowZoomPan 8s ease-in-out infinite;
        }

        .overlay-gradient {
          background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.4) 0%,
            rgba(0, 0, 0, 0.2) 30%,
            rgba(0, 0, 0, 0.3) 70%,
            rgba(0, 0, 0, 0.5) 100%
          );
        }

        @keyframes progressBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

      {/* Слайды с эффектом камеры */}
      <div className="relative w-full h-full">
        {activeSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 ${index === currentSlide ? "slide-active z-10" : "slide-inactive z-0"}`}
          >
            {/* Фоновое изображение с медленной анимацией */}
            <div
              className={`absolute inset-0 ${index === currentSlide ? "slide-bg-active" : ""}`}
              style={{
                backgroundImage: `url('${slide.image}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                willChange: "transform",
              }}
            />

            {/* Плавный градиентный оверлей */}
            <div className="absolute inset-0 overlay-gradient" />
          </div>
        ))}
      </div>

      {/* Навигационные стрелки */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition-all duration-500 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed opacity-60 hover:opacity-100"
            aria-label="Предыдущий слайд"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition-all duration-500 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed opacity-60 hover:opacity-100"
            aria-label="Следующий слайд"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Управление автовоспроизведением */}
      {activeSlides.length > 1 && (
        <button
          onClick={toggleAutoPlay}
          className="absolute top-4 right-4 z-30 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-500 hover:scale-110 opacity-60 hover:opacity-100"
          aria-label={isAutoPlaying ? "Остановить автовоспроизведение" : "Запустить автовоспроизведение"}
        >
          {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      )}

      {/* Индикаторы слайдов */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`transition-all duration-700 rounded-full ${
                index === currentSlide
                  ? "w-8 h-3 bg-white shadow-lg scale-110"
                  : "w-3 h-3 bg-white/50 hover:bg-white/75 hover:scale-110"
              } disabled:cursor-not-allowed`}
              aria-label={`Перейти к слайду ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Прогресс-бар автовоспроизведения */}
      {activeSlides.length > 1 && isAutoPlaying && !isTransitioning && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-30">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-teal-500 transition-all duration-100 ease-linear"
            style={{
              animation: "progressBar 8s linear infinite",
            }}
          />
        </div>
      )}
    </div>
  )
}
