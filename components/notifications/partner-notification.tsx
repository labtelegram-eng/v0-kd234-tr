"use client"

import { useState, useEffect, useRef, useMemo, type CSSProperties } from "react"
import { ExternalLink, Info } from "lucide-react"
import "@/styles/notifications.css"

interface PartnerNotificationProps {
  page: "home" | "blog" | "news" | "destinations"
  currentItemId?: number
  isVisible: boolean
  onClose: () => void
}

interface NotificationData {
  id: number
  title: string
  content: string
  cta_text: string
  cta_url: string
  is_active: boolean
  show_after_seconds: number
  show_on_pages: {
    home: boolean
    blog: boolean
    news: boolean
    destinations: boolean
  }
  limit_shows?: boolean
  max_shows_per_session?: number
  show_randomly?: boolean
  target_scope?: "pages" | "specific"
  targeted_news_ids?: number[]
  targeted_blog_ids?: number[]
}

const BEFORE_CLOSE_SECONDS = 10

// Session helpers
const getSessionId = (): string => {
  let sessionId = localStorage.getItem("partnerNotificationSession")
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem("partnerNotificationSession", sessionId)
  }
  return sessionId
}

const getNotificationViews = (notificationId: number): number => {
  const sessionId = getSessionId()
  const key = `notification_views_${sessionId}_${notificationId}`
  return Number.parseInt(localStorage.getItem(key) || "0", 10)
}

const incrementNotificationViews = (notificationId: number): number => {
  const sessionId = getSessionId()
  const key = `notification_views_${sessionId}_${notificationId}`
  const currentViews = getNotificationViews(notificationId)
  const newViews = currentViews + 1
  localStorage.setItem(key, newViews.toString())
  return newViews
}

const shouldShowNotification = (notification: NotificationData): boolean => {
  if (!notification.limit_shows) return true
  const currentViews = getNotificationViews(notification.id)
  const maxShows = notification.max_shows_per_session || 1
  if (currentViews >= maxShows) return false
  if (notification.show_randomly && currentViews > 0) {
    const probability = Math.max(0.1, 1 - currentViews / maxShows)
    return Math.random() < probability
  }
  return true
}

export function PartnerNotification({ page, currentItemId, isVisible, onClose }: PartnerNotificationProps) {
  const [selected, setSelected] = useState<NotificationData | null>(null)
  const [isShown, setIsShown] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [timeLeft, setTimeLeft] = useState(BEFORE_CLOSE_SECONDS)
  const [canClose, setCanClose] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const delayTimerRef = useRef<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Clear all timers/requests
  const clearDelayTimer = () => {
    if (delayTimerRef.current) {
      window.clearTimeout(delayTimerRef.current)
      delayTimerRef.current = null
    }
  }
  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearInterval(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }
  const abortFetch = () => {
    abortRef.current?.abort()
    abortRef.current = null
  }
  const resetState = () => {
    clearDelayTimer()
    clearCloseTimer()
    abortFetch()
    setIsShown(false)
    setIsAnimating(false)
    setSelected(null)
    setTimeLeft(BEFORE_CLOSE_SECONDS)
    setCanClose(false)
  }

  // Start the close countdown only after the banner is shown
  useEffect(() => {
    if (!isShown || !selected) return
    setTimeLeft(BEFORE_CLOSE_SECONDS)
    setCanClose(false)
    clearCloseTimer()

    closeTimerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanClose(true)
          clearCloseTimer()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return clearCloseTimer
  }, [isShown, selected])

  // Fetch and schedule show based on show_after_seconds
  useEffect(() => {
    // Guard: external visibility off means hide and stop everything
    if (!isVisible) {
      resetState()
      return
    }

    // When page/item changes or visibility toggles on, refetch and reschedule
    resetState()

    const fetchList = async () => {
      try {
        setIsLoading(true)
        abortRef.current = new AbortController()

        // Используем новый API endpoint для получения случайного уведомления
        const params = new URLSearchParams({
          page,
          ...(currentItemId && { currentItemId: currentItemId.toString() }),
        })

        const response = await fetch(`/api/partner-notification/random?${params}`, {
          headers: { "cache-control": "no-store" },
          signal: abortRef.current.signal,
        })

        if (!response.ok) {
          setIsLoading(false)
          return
        }

        const data = await response.json()

        if (!data.success || !data.notification) {
          setIsLoading(false)
          return
        }

        const notification = data.notification as NotificationData

        // Проверяем ограничения показов
        if (!shouldShowNotification(notification)) {
          setIsLoading(false)
          return
        }

        setSelected(notification)

        // Respect the per-notification delay
        const delayMs = Math.max(0, (notification.show_after_seconds || 0) * 1000)

        delayTimerRef.current = window.setTimeout(() => {
          // Only show if still externally visible and selected hasn't changed
          if (!isVisible) return
          setIsShown(true)
          setIsAnimating(true)
          incrementNotificationViews(notification.id)
          setIsLoading(false)
        }, delayMs)
      } catch (err) {
        // Swallow abort errors
        setIsLoading(false)
      }
    }

    void fetchList()

    return () => {
      resetState()
    }
  }, [isVisible, page, currentItemId])

  const handleClose = () => {
    if (!canClose) return
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
      resetState()
    }, 240)
  }

  const handleCtaClick = () => {
    if (selected?.cta_url) {
      window.open(selected.cta_url, "_blank", "noopener,noreferrer")
    }
    handleClose()
  }

  const progressPercent = useMemo(() => {
    return selected && isShown ? ((BEFORE_CLOSE_SECONDS - timeLeft) / BEFORE_CLOSE_SECONDS) * 100 : 0
  }, [timeLeft, selected, isShown])

  // Do not render until external flag is on AND our internal delay has elapsed
  if (!isVisible || !isShown || !selected) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1080]">
      <div className="w-full">
        <div
          className={[
            "w-full",
            "notice-card transition-all duration-300 rounded-t-2xl rounded-b-none overflow-hidden shadow-lg",
            isAnimating ? "notice-enter-active" : "notice-enter",
          ].join(" ")}
          role="region"
          aria-live="polite"
          aria-label="Партнёрское уведомление"
        >
          <div>
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="px-5 sm:px-6 py-4 sm:py-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                  <div className="flex w-full min-w-0 items-start gap-3 sm:gap-4">
                    <div className="mt-0.5 hidden sm:flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 border border-white/10 text-white">
                      <Info className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className="notice-title text-[15px] sm:text-base font-semibold tracking-[-0.01em]"
                        style={{ textWrap: "balance" } as CSSProperties}
                      >
                        {selected.title}
                      </h3>

                      <p
                        className="notice-body mt-1 text-[13px] sm:text-[14px] leading-6"
                        style={{ opacity: isLoading ? 0.75 : 1, transition: "opacity 220ms ease" }}
                      >
                        {selected.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <button onClick={handleCtaClick} className="notice-cta" disabled={!selected || isLoading}>
                      {selected?.cta_text || "Открыть"}
                      <ExternalLink className="ml-2 inline-block h-4 w-4 align-middle" />
                    </button>

                    <button
                      onClick={handleClose}
                      disabled={!canClose}
                      className="inline-flex items-center rounded-md px-2 py-1 text-xs"
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        cursor: canClose ? "pointer" : "not-allowed",
                        opacity: canClose ? 1 : 0.7,
                      }}
                      aria-live="polite"
                      aria-label={canClose ? "Закрыть уведомление" : `Закрыть через ${timeLeft} секунд`}
                      title={canClose ? "Можно закрыть" : `Закрыть через ${timeLeft} с`}
                    >
                      {canClose ? "Можно закрыть" : `Закрыть через ${timeLeft} c`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-1.5 w-full bg-white/10 rounded-none overflow-hidden">
            <div
              className="h-full brand-gradient transition-all duration-1000 ease-linear rounded-none"
              style={{ width: `${progressPercent}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartnerNotification
