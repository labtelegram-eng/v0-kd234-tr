"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

type Flag = "thai" | "russian"

interface AnimatedFlagLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  holdMs?: number // время показа каждого флага
  transitionMs?: number // длительность анимации
  pauseOnHover?: boolean
}

const FLAG_SRC: Record<Flag, string> = {
  thai: "/assets/thai-flag.png",
  russian: "/assets/russian-flag.jpg",
}

export function AnimatedFlagLogo({
  className = "",
  size = "md",
  holdMs = 2600,
  transitionMs = 900,
  pauseOnHover = true,
}: AnimatedFlagLogoProps) {
  const [current, setCurrent] = useState<Flag>("thai")
  const [nextFlag, setNextFlag] = useState<Flag>("russian")
  const [transitioning, setTransitioning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)

  // Размеры — сохраняем как прежде
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-6",
  }

  const holdTimer = useRef<number | null>(null)
  const transTimer = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      const update = () => setReduced(mq.matches)
      update()
      mq.addEventListener?.("change", update)
      return () => mq.removeEventListener?.("change", update)
    }
  }, [])

  const clearTimers = () => {
    if (holdTimer.current) {
      window.clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
    if (transTimer.current) {
      window.clearTimeout(transTimer.current)
      transTimer.current = null
    }
  }

  const queueNext = () => {
    if (paused) return
    holdTimer.current = window.setTimeout(() => {
      if (paused) return
      const coming: Flag = current === "thai" ? "russian" : "thai"
      setNextFlag(coming)
      setTransitioning(true)

      transTimer.current = window.setTimeout(() => {
        setCurrent(coming)
        setTransitioning(false)
        if (!paused) queueNext()
      }, reduced ? Math.min(400, transitionMs) : transitionMs)
    }, holdMs)
  }

  useEffect(() => {
    queueNext()
    return () => clearTimers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, paused, reduced, holdMs, transitionMs])

  const handleMouseEnter = () => {
    if (!pauseOnHover) return
    setPaused(true)
    clearTimers()
  }
  const handleMouseLeave = () => {
    if (!pauseOnHover) return
    setPaused(false)
    // плавный перезапуск цикла
    holdTimer.current = window.setTimeout(() => {
      if (!paused) queueNext()
    }, 250)
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[4px] ${sizeClasses[size]} ${className}`}
      role="img"
      aria-label="Анимация смены флагов: Таиланд и Россия"
      title="Таиланд ↔ Россия"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <style jsx>{`
        .ring {
          box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, 0.35),
            0 0 0 0.5px rgba(0, 0, 0, 0.2);
        }
        .base {
          transition: transform ${Math.max(300, Math.floor(transitionMs * 0.8))}ms ease,
            filter ${Math.max(300, Math.floor(transitionMs * 0.8))}ms ease,
            opacity ${Math.max(300, Math.floor(transitionMs * 0.8))}ms ease;
          will-change: transform, filter, opacity;
        }
        .overlay {
          transform: translateX(-110%);
        }
        .slideIn {
          animation-name: slideIn;
          animation-duration: ${transitionMs}ms;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          animation-fill-mode: forwards;
          will-change: transform;
        }
        .fadeIn {
          animation-name: fadeIn;
          animation-duration: ${Math.min(600, transitionMs)}ms;
          animation-timing-function: ease-out;
          animation-fill-mode: forwards;
        }
        .angled {
          /* диагональная форма фронта "шторки" */
          clip-path: polygon(0% 0%, 86% 0%, 100% 50%, 86% 100%, 0% 100%);
        }
        .sheen {
          background: linear-gradient(90deg, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0));
          mix-blend-mode: multiply;
        }
        @keyframes slideIn {
          from {
            transform: translateX(-110%);
          }
          to {
            transform: translateX(0%);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* reduced motion: убираем крупные перемещения */
        @media (prefers-reduced-motion: reduce) {
          .slideIn {
            animation: fadeIn ${Math.min(600, transitionMs)}ms ease-out forwards;
          }
        }
      `}</style>

      {/* Лёгкая подложка для контраста в крошечном размере */}
      <div className="absolute inset-0 bg-neutral-800/10 dark:bg-neutral-100/10" aria-hidden="true" />

      {/* Базовый слой — текущий флаг */}
      <div
        className={`absolute inset-0 base ${transitioning ? "scale-[0.985] opacity-95" : "scale-100 opacity-100"}`}
      >
        <Image
          src={FLAG_SRC[current] || "/placeholder.svg"}
          alt={current === "thai" ? "Флаг Таиланда" : "Флаг России"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 24px, 32px"
          quality={100}
          priority={false}
        />
      </div>

      {/* Слой "шторки" с диагональным фронтом — следующий флаг */}
      {transitioning && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Контейнер, который заезжает слева направо */}
          <div className={`absolute inset-0 overlay slideIn`} style={{ willChange: "transform" }}>
            {/* Маска с диагональю для фронта */}
            <div className="absolute inset-0 angled overflow-hidden">
              <Image
                src={FLAG_SRC[nextFlag] || "/placeholder.svg"}
                alt={nextFlag === "thai" ? "Флаг Таиланда" : "Флаг России"}
                fill
                className="object-cover scale-[1.015]"
                sizes="(max-width: 768px) 24px, 32px"
                quality={100}
                priority={false}
              />
              {/* Лёгкий затемнённый край для читаемости диагонали */}
              <div className="absolute inset-y-0 left-0 w-[14%] sheen" aria-hidden="true" />
            </div>
          </div>
        </div>
      )}

      {/* Мягкое кольцо-рамка поверх */}
      <div className="absolute inset-0 pointer-events-none ring rounded-[4px]" aria-hidden="true" />
    </div>
  )
}
