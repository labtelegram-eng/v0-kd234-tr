import { memo, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export type WidgetColor = "emerald" | "yellow" | "red" | "violet" | "gray"

const colorMap: Record<
  WidgetColor,
  { badge: string; accent: string; title: string; primary: string; ring: string }
> = {
  emerald: {
    badge: "bg-emerald-100 text-emerald-700",
    accent: "bg-emerald-500",
    title: "text-emerald-800",
    primary: "text-gray-900",
    ring: "focus:ring-emerald-200",
  },
  yellow: {
    badge: "bg-amber-100 text-amber-700",
    accent: "bg-amber-500",
    title: "text-amber-800",
    primary: "text-gray-900",
    ring: "focus:ring-amber-200",
  },
  red: {
    badge: "bg-rose-100 text-rose-700",
    accent: "bg-rose-500",
    title: "text-rose-800",
    primary: "text-gray-900",
    ring: "focus:ring-rose-200",
  },
  violet: {
    badge: "bg-violet-100 text-violet-700",
    accent: "bg-violet-500",
    title: "text-violet-800",
    primary: "text-gray-900",
    ring: "focus:ring-violet-200",
  },
  gray: {
    badge: "bg-gray-100 text-gray-700",
    accent: "bg-gray-500",
    title: "text-gray-800",
    primary: "text-gray-900",
    ring: "focus:ring-gray-200",
  },
}

type WidgetCardProps = {
  title: string
  icon: ReactNode
  color?: WidgetColor
  primary?: string
  secondary?: string
  hint?: string
  onClick?: () => void
  className?: string
  "aria-label"?: string
  tabIndex?: number
}

function WidgetCardImpl({
  title,
  icon,
  color = "gray",
  primary,
  secondary,
  hint,
  onClick,
  className,
  ...rest
}: WidgetCardProps) {
  const c = colorMap[color]
  const clickable = typeof onClick === "function"

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow",
        "hover:shadow-md",
        "min-h-[92px] flex flex-col",
        clickable ? "cursor-pointer" : "",
        className,
      )}
      onClick={onClick}
      role={clickable ? "button" : "group"}
      tabIndex={clickable ? 0 : -1}
      onKeyDown={(e) => {
        if (!clickable) return
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={rest["aria-label"] ?? title}
    >
      {/* Header: title on the left, icon on the right */}
      <div className="flex items-center justify-between">
        <div className={cn("inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium", c.badge)}>
          {title}
        </div>
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm",
            c.accent,
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      {/* Body */}
      <div className="mt-2 flex-1">
        <div className="flex min-h-[48px] flex-col items-start justify-center text-left">
          {primary && (
            <div className={cn("text-sm font-semibold leading-snug tabular-nums", c.primary)}>
              {primary}
            </div>
          )}
          {secondary && <div className="mt-0.5 text-xs text-gray-600">{secondary}</div>}
          {hint && <div className="mt-1 text-[11px] text-gray-500">{hint}</div>}
        </div>
      </div>
    </div>
  )
}

export const WidgetCard = memo(WidgetCardImpl)
WidgetCard.displayName = "WidgetCard"
