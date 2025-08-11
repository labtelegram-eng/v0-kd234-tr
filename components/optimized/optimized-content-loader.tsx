"use client"

import { useOptimizedFetch, usePerformanceOptimization } from "@/lib/content-optimization"
import { type ReactNode, Suspense } from "react"

interface OptimizedContentLoaderProps<T> {
  url: string
  cacheKey?: string
  priority?: "high" | "medium" | "low"
  preload?: boolean
  fallback?: ReactNode
  children: (data: T, loading: boolean, error: Error | null) => ReactNode
  className?: string
}

export function OptimizedContentLoader<T>({
  url,
  cacheKey,
  priority = "medium",
  preload = false,
  fallback,
  children,
  className = "",
}: OptimizedContentLoaderProps<T>) {
  const { data, loading, error } = useOptimizedFetch<T>(url, {
    cacheKey,
    priority,
    preload,
  })

  const { ref, shouldRender } = usePerformanceOptimization()

  // Если компонент не виден, не рендерим содержимое
  if (!shouldRender) {
    return (
      <div ref={ref} className={className}>
        {fallback || <ContentSkeleton />}
      </div>
    )
  }

  return (
    <div ref={ref} className={className}>
      <Suspense fallback={fallback || <ContentSkeleton />}>{children(data, loading, error)}</Suspense>
    </div>
  )
}

// Компонент скелетона для загрузки
function ContentSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  )
}
