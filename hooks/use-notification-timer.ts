import { useState, useEffect, useRef } from 'react'
import NotificationTimer from '@/lib/notification-timer'

interface UseNotificationTimerReturn {
  shouldShowNotification: boolean
  closeNotification: () => void
  timeRemaining: number
  isActive: boolean
}

export function useNotificationTimer(page: 'home' | 'blog' | 'news' | 'destinations'): UseNotificationTimerReturn {
  const [shouldShowNotification, setShouldShowNotification] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const timerRef = useRef<NotificationTimer | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Получаем настройки уведомления для данной страницы
    const fetchNotificationSettings = async () => {
      try {
        const response = await fetch(`/api/partner-notification/random?page=${page}`)
        if (response.ok) {
          const data = await response.json()
          if (data.notification) {
            const delay = data.notification.showAfterSeconds || 30
            
            // Создаем и запускаем таймер
            timerRef.current = new NotificationTimer(delay, () => {
              setShouldShowNotification(true)
              setIsActive(false)
            })
            
            timerRef.current.start()
            setIsActive(true)
            
            // Обновляем оставшееся время каждую секунду
            intervalRef.current = setInterval(() => {
              if (timerRef.current) {
                const remaining = timerRef.current.getRemainingTime()
                setTimeRemaining(remaining)
                
                if (remaining <= 0) {
                  setIsActive(false)
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                  }
                }
              }
            }, 1000)
          }
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error)
      }
    }

    fetchNotificationSettings()

    // Cleanup function
    return () => {
      if (timerRef.current) {
        timerRef.current.stop()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [page])

  const closeNotification = () => {
    setShouldShowNotification(false)
    if (timerRef.current) {
      timerRef.current.stop()
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setIsActive(false)
  }

  return {
    shouldShowNotification,
    closeNotification,
    timeRemaining,
    isActive
  }
}
