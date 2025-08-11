"use client"

import { useState, useEffect, useCallback, useRef } from "react"

// Типы для системы оптимизации
export interface OptimizationConfig {
  enableLazyLoading: boolean
  enableImageOptimization: boolean
  enableContentCaching: boolean
  enablePreloading: boolean
  cacheExpiration: number // в миллисекундах
  imageQuality: number
  maxImageWidth: number
  maxImageHeight: number
}

export interface CacheItem<T = any> {
  data: T
  timestamp: number
  expiration: number
}

export interface PreloadItem {
  url: string
  priority: "high" | "medium" | "low"
  type: "image" | "data" | "component"
}

// Конфигурация по умолчанию
const DEFAULT_CONFIG: OptimizationConfig = {
  enableLazyLoading: true,
  enableImageOptimization: true,
  enableContentCaching: true,
  enablePreloading: true,
  cacheExpiration: 5 * 60 * 1000, // 5 минут
  imageQuality: 85,
  maxImageWidth: 1920,
  maxImageHeight: 1080,
}

// Менеджер кэша
class CacheManager {
  private cache = new Map<string, CacheItem>()
  private maxSize = 100 // максимальное количество элементов в кэше

  set<T>(key: string, data: T, expiration?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiration: expiration || Date.now() + DEFAULT_CONFIG.cacheExpiration,
    }

    // Очищаем кэш если он переполнен
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, item)
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) return null

    // Проверяем не истек ли срок действия
    if (Date.now() > item.expiration) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (Date.now() > item.expiration) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  // Очистка устаревших элементов
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiration) {
        this.cache.delete(key)
      }
    }
  }
}

// Глобальный экземпляр кэш-менеджера
const cacheManager = new CacheManager()

// Менеджер предзагрузки
class PreloadManager {
  private preloadQueue: PreloadItem[] = []
  private preloadedItems = new Set<string>()
  private isProcessing = false

  add(item: PreloadItem): void {
    if (this.preloadedItems.has(item.url)) return

    // Сортируем по приоритету
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const insertIndex = this.preloadQueue.findIndex(
      (queueItem) => priorityOrder[queueItem.priority] > priorityOrder[item.priority],
    )

    if (insertIndex === -1) {
      this.preloadQueue.push(item)
    } else {
      this.preloadQueue.splice(insertIndex, 0, item)
    }

    this.processQueue()
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) return

    this.isProcessing = true

    while (this.preloadQueue.length > 0) {
      const item = this.preloadQueue.shift()!

      try {
        await this.preloadItem(item)
        this.preloadedItems.add(item.url)
      } catch (error) {
        console.warn(`Failed to preload ${item.url}:`, error)
      }

      // Небольшая задержка между предзагрузками
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    this.isProcessing = false
  }

  private async preloadItem(item: PreloadItem): Promise<void> {
    switch (item.type) {
      case "image":
        return this.preloadImage(item.url)
      case "data":
        return this.preloadData(item.url)
      default:
        return Promise.resolve()
    }
  }

  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
    })
  }

  private async preloadData(url: string): Promise<void> {
    const response = await fetch(url)
    const data = await response.json()
    cacheManager.set(url, data)
  }
}

const preloadManager = new PreloadManager()

// Хук для оптимизированной загрузки данных
export function useOptimizedFetch<T>(
  url: string,
  options: {
    enabled?: boolean
    cacheKey?: string
    preload?: boolean
    priority?: "high" | "medium" | "low"
  } = {},
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const { enabled = true, cacheKey = url, preload = false, priority = "medium" } = options

  const fetchData = useCallback(async () => {
    if (!enabled) return

    // Проверяем кэш
    const cachedData = cacheManager.get<T>(cacheKey)
    if (cachedData) {
      setData(cachedData)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Сохраняем в кэш
      cacheManager.set(cacheKey, result)
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [url, enabled, cacheKey])

  useEffect(() => {
    if (preload) {
      preloadManager.add({ url, priority, type: "data" })
    }

    fetchData()
  }, [fetchData, preload, url, priority])

  const refetch = useCallback(() => {
    cacheManager.cache.delete(cacheKey)
    fetchData()
  }, [cacheKey, fetchData])

  return { data, loading, error, refetch }
}

// Хук для ленивой загрузки изображений
export function useLazyImage(
  src: string,
  options: {
    rootMargin?: string
    threshold?: number
    placeholder?: string
  } = {},
) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const { rootMargin = "50px", threshold = 0.1, placeholder } = options

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold },
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [rootMargin, threshold])

  useEffect(() => {
    if (isInView && src) {
      const img = new Image()
      img.onload = () => {
        setImageSrc(src)
        setIsLoaded(true)
      }
      img.src = src
    }
  }, [isInView, src])

  return {
    ref: imgRef,
    src: imageSrc || placeholder,
    isLoaded,
    isInView,
  }
}

// Хук для оптимизации производительности компонентов
export function usePerformanceOptimization() {
  const [isVisible, setIsVisible] = useState(true)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0 },
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Очистка кэша при размонтировании
  useEffect(() => {
    const cleanup = () => cacheManager.cleanup()
    const interval = setInterval(cleanup, 60000) // каждую минуту

    return () => {
      clearInterval(interval)
      cleanup()
    }
  }, [])

  return {
    ref: elementRef,
    isVisible,
    shouldRender: isVisible, // компонент должен рендериться только если виден
  }
}

// Утилиты для оптимизации
export const OptimizationUtils = {
  // Предзагрузка критических ресурсов
  preloadCriticalResources: (resources: PreloadItem[]) => {
    resources.forEach((resource) => preloadManager.add(resource))
  },

  // Очистка кэша
  clearCache: () => {
    cacheManager.clear()
  },

  // Получение статистики кэша
  getCacheStats: () => {
    return {
      size: cacheManager.cache.size,
      maxSize: 100,
    }
  },

  // Оптимизация изображений
  optimizeImageUrl: (url: string, width?: number, height?: number, quality?: number) => {
    const params = new URLSearchParams()
    if (width) params.set("w", width.toString())
    if (height) params.set("h", height.toString())
    if (quality) params.set("q", quality.toString())

    const separator = url.includes("?") ? "&" : "?"
    return `${url}${separator}${params.toString()}`
  },

  // Дебаунс для оптимизации поиска
  debounce: <T extends (...args: any[]) => any>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  // Троттлинг для скролла
  throttle: <T extends (...args: any[]) => any>(func: T, limit: number): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },
}

// Экспорт для использования в других компонентах
export { cacheManager, preloadManager }
