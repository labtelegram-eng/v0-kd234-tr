"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import React from "react"

interface HomePageSettings {
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  slides: any[]
}

type HoverPhase = "idle" | "forward" | "back"
type ClickPhase = "idle" | "forward" | "back"

interface HeroContentProps {
  // New optional callback to open planning modal from the original button
  onStartPlanning?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export function HeroContent({ onStartPlanning }: HeroContentProps) {
  const [contentLoaded, setContentLoaded] = useState(false)
  const [homeSettings, setHomeSettings] = useState<HomePageSettings>({
    heroTitle: "Откройте для себя чудеса Таиланда",
    heroSubtitle:
      "Откройте для себя красоту, культуру и приключения, которые ждут вас в Стране Улыбок. Спланируйте свое идеальное путешествие с нашим подробным гидом.",
    heroButtonText: "Начать планирование",
    slides: [],
  })

  // Radial color-fill (hover) state: always fills fully, then immediately returns
  const [hoverPhase, setHoverPhase] = useState<HoverPhase>("idle")
  const hoverForwardTimer = useRef<number | null>(null)
  const hoverBackTimer = useRef<number | null>(null)

  // Radial color-fill (click) state: fills with a special gradient, then returns
  const [clickPhase, setClickPhase] = useState<ClickPhase>("idle")
  const clickForwardTimer = useRef<number | null>(null)
  const clickBackTimer = useRef<number | null>(null)

  // Timings
  const HOVER_FORWARD_MS = 1100
  const HOVER_BACK_MS = 900
  const CLICK_FORWARD_MS = 900
  const CLICK_BACK_MS = 800

  function clearHoverTimers() {
    if (hoverForwardTimer.current) {
      window.clearTimeout(hoverForwardTimer.current)
      hoverForwardTimer.current = null
    }
    if (hoverBackTimer.current) {
      window.clearTimeout(hoverBackTimer.current)
      hoverBackTimer.current = null
    }
  }

  function clearClickTimers() {
    if (clickForwardTimer.current) {
      window.clearTimeout(clickForwardTimer.current)
      clickForwardTimer.current = null
    }
    if (clickBackTimer.current) {
      window.clearTimeout(clickBackTimer.current)
      clickBackTimer.current = null
    }
  }

  function onHoverStart() {
    clearHoverTimers()
    setHoverPhase("forward")
    // Once fully filled, immediately start returning
    hoverForwardTimer.current = window.setTimeout(() => {
      setHoverPhase("back")
      hoverBackTimer.current = window.setTimeout(() => setHoverPhase("idle"), HOVER_BACK_MS)
    }, HOVER_FORWARD_MS)
  }

  function onHoverEnd() {
    // For keyboard focus loss or explicit end — ensure we return
    clearHoverTimers()
    setHoverPhase("back")
    hoverBackTimer.current = window.setTimeout(() => setHoverPhase("idle"), HOVER_BACK_MS)
  }

  function onClickBurst(e?: React.MouseEvent<HTMLButtonElement>) {
    // Start the click burst effect; it fills fully even if mouse leaves, then returns
    clearClickTimers()
    setClickPhase("forward")
    clickForwardTimer.current = window.setTimeout(() => {
      setClickPhase("back")
      clickBackTimer.current = window.setTimeout(() => setClickPhase("idle"), CLICK_BACK_MS)
    }, CLICK_FORWARD_MS)

    // Call external handler to open planning modal from this original button
    if (onStartPlanning && e) {
      onStartPlanning(e)
    }
  }

  useEffect(() => {
    return () => {
      clearHoverTimers()
      clearClickTimers()
    }
  }, [])

  // Load homepage settings and trigger content fade-in
  useEffect(() => {
    const loadHomeSettings = async () => {
      try {
        const response = await fetch("/api/home-settings")
        if (response.ok) {
          const data = await response.json()
          setHomeSettings(data.settings)
        }
      } catch (error) {
        console.error("Load home settings error:", error)
      }
      setTimeout(() => setContentLoaded(true), 800)
    }
    loadHomeSettings()
  }, [])

  const hoverPhaseClass =
    hoverPhase === "forward" ? "hover-forward" : hoverPhase === "back" ? "hover-back" : ""
  const clickPhaseClass =
    clickPhase === "forward" ? "click-forward" : clickPhase === "back" ? "click-back" : ""
  const hoverDuration = hoverPhase === "forward" ? HOVER_FORWARD_MS : hoverPhase === "back" ? HOVER_BACK_MS : 0
  const clickDuration = clickPhase === "forward" ? CLICK_FORWARD_MS : clickPhase === "back" ? CLICK_BACK_MS : 0

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20">
      <style jsx>{`
        /* Content fade-in */
        @keyframes heroContentFadeIn {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          30% {
            opacity: 0;
            transform: translateY(30px) scale(0.97);
          }
          60% {
            opacity: 0.5;
            transform: translateY(15px) scale(0.99);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .hero-content-show {
          animation: heroContentFadeIn 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .will-change-transform-opacity {
          will-change: transform, opacity;
        }

        /* Gentle idle breathing */
        @keyframes gentlePulse {
          0%,
          100% {
            transform: scale(0.99);
          }
          50% {
            transform: scale(1.01);
          }
        }
        .btn-gentle-pulse {
          animation: gentlePulse 5.2s ease-in-out infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .btn-gentle-pulse {
            animation: none;
          }
        }

        /* Radial overlays:
           - ::before = hover overlay (emerald → teal)
           - ::after  = click overlay (blue gradient)
           Both use clip-path circle that we animate via state classes. */
        .radial-multi {
          position: relative;
          isolation: isolate;
        }

        .radial-multi::before,
        .radial-multi::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          clip-path: circle(0% at 50% 50%);
          z-index: 0;
        }

        /* Hover overlay (emerald -> teal) at 90% opacity */
        .radial-multi::before {
          background: linear-gradient(90deg, rgba(5, 150, 105, 0.9), rgba(20, 184, 166, 0.9));
          transition: clip-path var(--hover-duration, 0ms) ease-in-out;
        }

        /* Click overlay: blue gradient at 90% opacity */
        .radial-multi::after {
          background: linear-gradient(90deg, rgba(59, 130, 246, 0.9), rgba(29, 78, 216, 0.9));
          transition: clip-path var(--click-duration, 0ms) ease-in-out;
          z-index: 1;
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          clip-path: circle(0% at 50% 50%);
        }

        /* Hover phases */
        .radial-multi.hover-forward::before {
          clip-path: circle(150% at 50% 50%);
        }
        .radial-multi.hover-back::before {
          clip-path: circle(0% at 50% 50%);
        }

        /* Click phases */
        .radial-multi.click-forward::after {
          clip-path: circle(150% at 50% 50%);
        }
        .radial-multi.click-back::after {
          clip-path: circle(0% at 50% 50%);
        }

        /* Content above overlays */
        .btn-label {
          position: relative;
          z-index: 2;
        }
      `}</style>

      <div
        className={`text-center text-white px-4 max-w-4xl will-change-transform-opacity ${
          contentLoaded ? "hero-content-show" : "opacity-0 translate-y-10 scale-95"
        }`}
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 drop-shadow-2xl">
          {homeSettings.heroTitle}
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
          {homeSettings.heroSubtitle}
        </p>

        <Button
          aria-label="Начать планирование"
          // Hover behavior
          onMouseEnter={onHoverStart}
          onFocus={onHoverStart}
          onMouseLeave={onHoverEnd}
          onBlur={onHoverEnd}
          // Click/Tap behavior (also trigger via keyboard)
          onClick={(e) => onClickBurst(e)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onClickBurst(e as any)
            }
          }}
          className={[
            // Base button styling
            "relative isolate overflow-hidden",
            // Base gradient (emerald → teal) with ~90% opacity
            "bg-gradient-to-r from-emerald-700/90 to-teal-600/90",
            "text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg",
            "text-sm sm:text-base md:text-lg font-semibold",
            "shadow-lg hover:shadow-xl",
            // Slight grow on hover (kept as requested)
            "transition-[transform,box-shadow] duration-700 ease-out",
            "hover:scale-[1.03]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500/70",
            // Idle breathing
            "btn-gentle-pulse",
            // Radial overlays controller classes
            "radial-multi",
            hoverPhaseClass,
            clickPhaseClass,
          ].join(" ")}
          style={
            {
              ["--hover-duration" as any]: `${hoverDuration}ms`,
              ["--click-duration" as any]: `${clickDuration}ms`,
            } as React.CSSProperties
          }
        >
          <span className="btn-label">{homeSettings.heroButtonText}</span>
        </Button>
      </div>
    </div>
  )
}
