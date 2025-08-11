"use client"

import { useState, useEffect } from "react"
import { Shield } from 'lucide-react'
import { useRouter } from "next/navigation"
import { WidgetCard, type WidgetColor } from "./widget-card"

interface SafetyData {
  status: "safe" | "medium" | "danger"
  level: string
  reason: string
  relatedNewsId?: number
}

export function SafetyStatusWidget() {
  const [safetyData, setSafetyData] = useState<SafetyData>({
    status: "safe",
    level: "Безопасно",
    reason: "Обычная туристическая активность",
  })
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      try {
        const response = await fetch("/api/news-widgets")
        if (response.ok) {
          const data = await response.json()
          const safetyWidget = data.widgets?.find((w: any) => w.type === "safety" && w.isActive)
          if (safetyWidget?.settings) {
            setSafetyData({
              status: safetyWidget.settings.status || "safe",
              level: safetyWidget.settings.level || "Безопасно",
              reason: safetyWidget.settings.reason || "Обычная туристическая активность",
              relatedNewsId: safetyWidget.settings.relatedNewsId,
            })
          }
        }
      } catch (error) {
        console.error("Ошибка загрузки данных безопасности:", error)
      }
    })()
  }, [])

  const colorByStatus: Record<SafetyData["status"], WidgetColor> = {
    safe: "emerald",
    medium: "yellow",
    danger: "red",
  }

  const tintByStatus: Record<SafetyData["status"], string> = {
    safe: "bg-emerald-50",
    medium: "bg-amber-50",
    danger: "bg-rose-50",
  }

  const handleClick = () => {
    if (safetyData.relatedNewsId) {
      router.push(`/news/${safetyData.relatedNewsId}`)
    }
  }

  const color = colorByStatus[safetyData.status]
  const tint = tintByStatus[safetyData.status]

  return (
    <WidgetCard
      title="Безопасность"
      icon={<Shield className="w-3.5 h-3.5" />}
      color={color}
      primary={safetyData.level}
      secondary={safetyData.reason}
      onClick={safetyData.relatedNewsId ? handleClick : undefined}
      // Internal background tint by status while preserving the original card design
      className={tint}
    />
  )
}
