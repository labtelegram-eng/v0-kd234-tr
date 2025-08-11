"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SuggestionItem = {
  id: string
  label: string
  color?: string // bg color for the circle
}

interface SuggestionsShortcutsProps {
  title?: string
  items?: SuggestionItem[]
  className?: string
  // Number of items visible per "page" on large screens
  visibleCount?: number
}

/**
 * Compact circular shortcuts, horizontally scrollable with mouse wheel.
 * - Shows small colored circles with a thin teal ring, label underneath (truncated).
 * - Defaults to 6 visible on large screens.
 * - Excludes deprecated items explicitly.
 */
export function SuggestionsShortcuts({
  title = "Ваша подборка предложений",
  items,
  className,
  visibleCount = 6,
}: SuggestionsShortcutsProps) {
  // Default dataset (without deprecated items)
  const defaultItems: SuggestionItem[] = [
    { id: "beach", label: "Пляжи", color: "#0ea5a7" },
    { id: "temples", label: "Храмы", color: "#f59e0b" },
    { id: "markets", label: "Рынки", color: "#06b6d4" },
    { id: "tours", label: "Экскурсии", color: "#22c55e" },
    { id: "kids", label: "С детьми", color: "#a78bfa" },
    { id: "romance", label: "Романтика", color: "#f43f5e" },
    { id: "spa", label: "SPA", color: "#94a3b8" },
    { id: "diving", label: "Дайвинг", color: "#0284c7" },
    { id: "shopping", label: "Шопинг", color: "#e11d48" },
    { id: "safari", label: "Сафари", color: "#b45309" },
    { id: "museums", label: "Музеи", color: "#16a34a" },
    { id: "parks", label: "Парки", color: "#10b981" },
  ]

  // If caller passes items, filter out deprecated labels.
  const deprecatedLabels = new Set(["Подобрать еду", "Найти место для фото", "Ночная жизнь рядом"])
  const data = (items ?? defaultItems).filter((i) => !deprecatedLabels.has(i.label))

  // Sizes and layout variables (CSS custom props) to enforce 6 visible on lg+
  const ITEM_SIZE = 56 // px circle diameter
  const GAP = 12 // px gap between items
  // Outer width per item block including label; we'll approximate width used for layout width.
  const ITEM_BLOCK_WIDTH = 72 // px per item block
  const visibleWidth = ITEM_BLOCK_WIDTH * visibleCount + GAP * (visibleCount - 1)

  const scrollerRef = React.useRef<HTMLDivElement>(null)

  // Map vertical mouse wheel to horizontal scroll
  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (!scrollerRef.current) return
    // Allow shift+wheel or trackpad gestures; prioritize horizontal scroll
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
    scrollerRef.current.scrollLeft += delta
    // Prevent the page from scrolling vertically when over the scroller
    e.preventDefault()
  }

  // Keyboard accessibility: left/right arrow scroll
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!scrollerRef.current) return
    const step = ITEM_BLOCK_WIDTH * 2
    if (e.key === "ArrowRight") {
      scrollerRef.current.scrollLeft += step
      e.preventDefault()
    } else if (e.key === "ArrowLeft") {
      scrollerRef.current.scrollLeft -= step
      e.preventDefault()
    }
  }

  return (
    <section aria-label={title} className={cn("w-full", "py-4 sm:py-6", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">{title}</h2>

        <div className="grid grid-cols-12 gap-4 items-start">
          {/* Left side: circle scroller */}
          <div className="col-span-12 lg:col-span-5 xl:col-span-4">
            <div
              ref={scrollerRef}
              role="listbox"
              aria-label="Быстрые категории"
              tabIndex={0}
              onWheel={onWheel}
              onKeyDown={onKeyDown}
              className={cn(
                "relative overflow-x-auto overflow-y-hidden",
                "scroll-smooth",
                "rounded-xl border border-gray-200 bg-white",
                "px-3 py-3",
              )}
              style={
                {
                  ["--item-size" as any]: `${ITEM_SIZE}px`,
                  ["--gap" as any]: `${GAP}px`,
                  maxWidth: `${visibleWidth}px`,
                } as React.CSSProperties
              }
            >
              <div
                className={cn("flex items-start", "gap-[var(--gap)]", "pr-2")}
                // Enable scroll snap like pages of 6 items (best-effort UX)
                style={{ scrollSnapType: "x proximity" }}
              >
                {data.map((it) => (
                  <button
                    key={it.id}
                    role="option"
                    aria-label={it.label}
                    className={cn("group shrink-0", "flex flex-col items-center w-[72px]")}
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <span
                      className={cn(
                        "relative inline-flex items-center justify-center",
                        "rounded-full",
                        "ring-2 ring-teal-500/80",
                        "outline-none",
                        "transition-transform duration-200",
                        "hover:scale-105 focus-visible:scale-105",
                      )}
                      style={{
                        width: "var(--item-size)",
                        height: "var(--item-size)",
                        backgroundColor: it.color ?? "#0ea5a7",
                        boxShadow: "0 0 0 2px rgba(13, 148, 136, 0.15), inset 0 0 0 1px rgba(255,255,255,0.35)",
                      }}
                    >
                      {/* Decorative inner ring */}
                      <span aria-hidden="true" className="absolute inset-0 rounded-full ring-1 ring-white/40" />
                    </span>
                    <span
                      className={cn("mt-1.5 text-[11px] leading-tight text-gray-700", "max-w-[72px] truncate")}
                      title={it.label}
                    >
                      {it.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">Колесиком мыши прокручивайте влево / вправо</p>
          </div>

          {/* Right part of the block: reserved area (can hold content, stays flexible) */}
          <div className="col-span-12 lg:col-span-7 xl:col-span-8">
            <div className="rounded-xl border border-dashed border-gray-200 bg-white/60 p-4 text-sm text-gray-500">
              Здесь может быть список предложений, детали и фильтры. Левая колонка — круговые ярлыки.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
