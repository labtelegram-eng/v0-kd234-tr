"use client"

import { useState, useEffect } from "react"
import { OptimizationUtils } from "@/lib/content-optimization"

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  cacheHitRate: number
  memoryUsage: number
  fps: number
}

export function PerformanceMonitor({ enabled = false }: { enabled?: boolean }) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    fps: 0,
  })

  useEffect(() => {
    if (!enabled) return

    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()

      if (currentTime - lastTime >= 1000) {
        setMetrics((prev) => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (currentTime - lastTime)),
        }))
        frameCount = 0
        lastTime = currentTime
      }

      animationId = requestAnimationFrame(measureFPS)
    }

    const measurePerformance = () => {
      // Время загрузки страницы
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      if (navigation) {
        setMetrics((prev) => ({
          ...prev,
          loadTime: navigation.loadEventEnd - navigation.navigationStart,
        }))
      }

      // Использование памяти (если доступно)
      if ("memory" in performance) {
        const memory = (performance as any).memory
        setMetrics((prev) => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // MB
        }))
      }

      // Статистика кэша
      const cacheStats = OptimizationUtils.getCacheStats()
      setMetrics((prev) => ({
        ...prev,
        cacheHitRate: cacheStats.size > 0 ? (cacheStats.size / cacheStats.maxSize) * 100 : 0,
      }))
    }

    measureFPS()
    measurePerformance()

    const interval = setInterval(measurePerformance, 5000)

    return () => {
      cancelAnimationFrame(animationId)
      clearInterval(interval)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="space-y-1">
        <div>Load: {metrics.loadTime.toFixed(0)}ms</div>
        <div>FPS: {metrics.fps}</div>
        <div>Cache: {metrics.cacheHitRate.toFixed(1)}%</div>
        <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
      </div>
    </div>
  )
}
