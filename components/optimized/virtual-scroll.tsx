"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { OptimizationUtils } from "@/lib/content-optimization"

interface VirtualScrollProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
}

export function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = "",
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Оптимизированный обработчик скролла
  const handleScroll = useMemo(
    () =>
      OptimizationUtils.throttle((e: Event) => {
        const target = e.target as HTMLDivElement
        setScrollTop(target.scrollTop)
      }, 16), // ~60fps
    [],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Вычисляем видимые элементы
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan)
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  // Создаем видимые элементы
  const visibleItems = useMemo(() => {
    const result = []
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      result.push({
        index: i,
        item: items[i],
        offsetY: i * itemHeight,
      })
    }
    return result
  }, [visibleRange, items, itemHeight])

  const totalHeight = items.length * itemHeight

  return (
    <div ref={containerRef} className={`overflow-auto ${className}`} style={{ height: containerHeight }}>
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map(({ index, item, offsetY }) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: offsetY,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}
