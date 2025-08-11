"use client"

import { useState, useEffect } from "react"
import { TimeWidget } from "./time-widget"
import { EmergencyServicesWidget } from "./emergency-services-widget"
import { EmbassyWidget } from "./embassy-widget"
import { TouristHelpWidget } from "./tourist-help-widget"
import { SafetyStatusWidget } from "./safety-status-widget"
import { QuickLinksWidget } from "./quick-links-widget"

interface Widget {
  id: number
  type: string
  title: string
  isActive: boolean
  order: number
  settings: any
  createdAt: string
  updatedAt: string
}

const WIDGET_COMPONENTS = {
  "thailand-time": TimeWidget,
  "emergency-contacts": EmergencyServicesWidget,
  "embassy-info": EmbassyWidget,
  "tourist-hotline": TouristHelpWidget,
  "safety-status": SafetyStatusWidget,
  "weather-info": QuickLinksWidget,
}

export function NewsWidgetsContainer() {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWidgets()
  }, [])

  const fetchWidgets = async () => {
    try {
      console.log("🔄 Fetching news widgets...")
      const response = await fetch("/api/news-widgets")
      if (response.ok) {
        const data = await response.json()
        console.log("📦 Received widgets data:", data)
        const activeWidgets = (data.widgets || [])
          .filter((w: Widget) => w.isActive)
          .sort((a: Widget, b: Widget) => a.order - b.order)
        console.log("✅ Active widgets:", activeWidgets)
        setWidgets(activeWidgets)
      } else {
        console.error("❌ Failed to fetch widgets:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("❌ Error fetching widgets:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mb-8">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-4 px-4 min-w-max">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-48 h-24 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (widgets.length === 0) {
    return (
      <div className="mb-8">
        <div className="text-center py-8 text-gray-500">
          <p>Виджеты не найдены. Проверьте подключение к базе данных.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 px-4 min-w-max">
          {widgets.map((widget) => {
            const WidgetComponent = WIDGET_COMPONENTS[widget.type as keyof typeof WIDGET_COMPONENTS]
            if (!WidgetComponent) {
              console.warn(`⚠️ Unknown widget type: ${widget.type}`)
              return null
            }

            return (
              <div key={widget.id} className="w-48 h-24 flex-shrink-0">
                <WidgetComponent {...widget.settings} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
