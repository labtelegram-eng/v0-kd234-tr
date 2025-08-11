"use client"

import { useState } from "react"
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Plane,
  Home,
  Utensils,
  Camera,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CircularShortcutsProps {
  onSectionSelect?: (sectionId: string) => void
}

const sections = [
  { id: "destinations", icon: MapPin, label: "Направления", color: "bg-blue-500" },
  { id: "dates", icon: Calendar, label: "Даты", color: "bg-green-500" },
  { id: "group", icon: Users, label: "Группа", color: "bg-purple-500" },
  { id: "budget", icon: DollarSign, label: "Бюджет", color: "bg-yellow-500" },
  { id: "transport", icon: Plane, label: "Транспорт", color: "bg-red-500" },
  { id: "accommodation", icon: Home, label: "Проживание", color: "bg-indigo-500" },
  { id: "food", icon: Utensils, label: "Питание", color: "bg-orange-500" },
  { id: "activities", icon: Camera, label: "Активности", color: "bg-pink-500" },
]

export function CircularShortcuts({ onSectionSelect }: CircularShortcutsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 4

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + itemsPerView >= sections.length ? 0 : prev + itemsPerView))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, sections.length - itemsPerView) : Math.max(0, prev - itemsPerView),
    )
  }

  const visibleSections = sections.slice(currentIndex, currentIndex + itemsPerView)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Быстрые переходы</h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex + itemsPerView >= sections.length}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {visibleSections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              onClick={() => onSectionSelect?.(section.id)}
              className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div
                className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white mb-2", section.color)}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center leading-tight">{section.label}</span>
            </button>
          )
        })}
      </div>

      {sections.length > itemsPerView && (
        <div className="flex justify-center mt-3 space-x-1">
          {Array.from({ length: Math.ceil(sections.length / itemsPerView) }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                Math.floor(currentIndex / itemsPerView) === index ? "bg-blue-500" : "bg-gray-300",
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
