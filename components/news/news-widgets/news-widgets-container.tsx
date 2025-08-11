"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { TimeWidget } from "./time-widget"
import { EmergencyServicesWidget } from "./emergency-services-widget"
import { EmbassyWidget } from "./embassy-widget"
import { TouristHelpWidget } from "./tourist-help-widget"
import { SafetyStatusWidget } from "./safety-status-widget"
import { QuickLinksWidget } from "./quick-links-widget"
import styles from "./h-scroll.module.css"

interface Widget {
  id: string
  type: string
  title: string
  is_active: boolean
  order_index: number
  settings: any
}

const WIDGET_COMPONENTS = {
  time: TimeWidget,
  emergency: EmergencyServicesWidget,
  embassy: EmbassyWidget,
  tourist_help: TouristHelpWidget,
  safety_status: SafetyStatusWidget,
  quick_links: QuickLinksWidget,
}

export function NewsWidgetsContainer() {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const itemsPerView = 5

  useEffect(() => {
    fetchWidgets()
  }, [])

  const fetchWidgets = async () => {
    try {
      const response = await fetch("/api/news-widgets")
      if (response.ok) {
        const data = await response.json()
        const activeWidgets = data
          .filter((w: Widget) => w.is_active)
          .sort((a: Widget, b: Widget) => a.order_index - b.order_index)
        setWidgets(activeWidgets)
      }
    } catch (error) {
      console.error("Error fetching widgets:", error)
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, widgets.length - itemsPerView)
      return Math.min(prev + 1, maxIndex)
    })
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Полезные виджеты</h2>
        </div>
        <div className="flex space-x-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-64 h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (widgets.length === 0) {
    return null
  }

  const canScrollLeft = currentIndex > 0
  const canScrollRight = currentIndex < widgets.length - itemsPerView

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Полезные виджеты</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={prevSlide}
            disabled={!canScrollLeft}
            className="p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Предыдущие виджеты"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            disabled={!canScrollRight}
            className="p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Следующие виджеты"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={styles.scrollContainer}>
        <div
          className={styles.scrollContent}
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {widgets.map((widget) => {
            const WidgetComponent = WIDGET_COMPONENTS[widget.type as keyof typeof WIDGET_COMPONENTS]
            if (!WidgetComponent) return null

            return (
              <div key={widget.id} className={styles.scrollItem}>
                <WidgetComponent {...widget.settings} />
              </div>
            )
          })}
        </div>
      </div>

      {widgets.length > itemsPerView && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(widgets.length / itemsPerView) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * itemsPerView)}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(currentIndex / itemsPerView) === index ? "bg-blue-500" : "bg-gray-300"
              }`}
              aria-label={`Перейти к группе виджетов ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
