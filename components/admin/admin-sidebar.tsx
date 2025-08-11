"use client"

import { useState } from "react"
import { LayoutDashboard, MapPin, Home, Music, Video, Newspaper, Settings, PenTool, Users, Database, ChevronDown, ChevronRight, Bell, Square } from 'lucide-react'

interface AdminSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const [isPartnerMenuOpen, setIsPartnerMenuOpen] = useState(
    activeSection === "partner-notifications" || activeSection === "partner-blocks"
  )

  const handlePartnerSubMenuClick = (subSection: string) => {
    if (subSection === "partner-blocks") {
      alert("В разработке")
    } else {
      onSectionChange(subSection)
    }
  }

  const menuItems = [
    {
      id: "dashboard",
      label: "Панель управления",
      icon: LayoutDashboard,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
    },
    {
      id: "destinations",
      label: "Направления",
      icon: MapPin,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
    },
    {
      id: "homepage",
      label: "Главная страница",
      icon: Home,
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-50 to-red-50",
    },
    {
      id: "music",
      label: "Музыка",
      icon: Music,
      gradient: "from-purple-500 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50",
    },
    {
      id: "culture-video",
      label: "Видео о культуре",
      icon: Video,
      gradient: "from-pink-500 to-rose-600",
      bgGradient: "from-pink-50 to-rose-50",
    },
    {
      id: "news",
      label: "Новости",
      icon: Newspaper,
      gradient: "from-cyan-500 to-blue-600",
      bgGradient: "from-cyan-50 to-blue-50",
    },
    {
      id: "news-widgets",
      label: "Виджеты новостей",
      icon: Settings,
      gradient: "from-gray-500 to-slate-600",
      bgGradient: "from-gray-50 to-slate-50",
    },
    {
      id: "blogs",
      label: "Блоги",
      icon: PenTool,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      id: "database",
      label: "База данных",
      icon: Database,
      gradient: "from-indigo-500 to-purple-600",
      bgGradient: "from-indigo-50 to-purple-50",
    },
  ] as const

  const isActive = (id: string) => activeSection === id

  return (
    <div className="fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-white border-r border-gray-200 shadow-lg overflow-y-auto">
      <div className="p-3">
        {/* Special primary action at the very top */}
        <div className="mb-3">
          <button
            onClick={() => onSectionChange("write")}
            className={`w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold 
              bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md hover:shadow-lg transition-all`}
            aria-current={isActive("write")}
          >
            <PenTool className="w-4 h-4" />
            Написать статью
          </button>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-gray-200 mb-3" />

        {/* Навигационное меню */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.id)
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center space-x-2.5 p-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  active
                    ? `bg-gradient-to-r ${item.bgGradient} text-gray-900 shadow-sm`
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    active
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-sm`
                      : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="leading-tight">{item.label}</span>
                {active && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-400 transform group-hover:translate-x-0.5 transition-transform" />
                )}
              </button>
            )
          })}

          {/* Партнерка с подменю */}
          <div>
            <button
              onClick={() => setIsPartnerMenuOpen(!isPartnerMenuOpen)}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive("partner-notifications") || isActive("partner-blocks")
                  ? "bg-gradient-to-r from-yellow-50 to-amber-50 text-gray-900 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  isActive("partner-notifications") || isActive("partner-blocks")
                    ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                }`}
              >
                <Users className="w-4 h-4" />
              </div>
              <span className="leading-tight">Партнерка</span>
              <ChevronDown
                className={`w-3.5 h-3.5 ml-auto text-gray-400 transition-transform duration-200 ${
                  isPartnerMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isPartnerMenuOpen && (
              <div className="ml-4 mt-1 space-y-1">
                <button
                  onClick={() => handlePartnerSubMenuClick("partner-notifications")}
                  className={`w-full flex items-center space-x-2.5 p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("partner-notifications")
                      ? "bg-gradient-to-r from-yellow-50 to-amber-50 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>Уведомления</span>
                </button>

                <button
                  onClick={() => handlePartnerSubMenuClick("partner-blocks")}
                  className="w-full flex items-center space-x-2.5 p-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                >
                  <Square className="w-4 h-4" />
                  <span>Блоки</span>
                  <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                    В разработке
                  </span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Информационная панель */}
        <div className="mt-6 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-100">
          <h3 className="text-xs font-semibold text-gray-700 mb-1.5">Система</h3>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center justify-between">
              <span>Статус:</span>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">Активна</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Версия:</span>
              <span className="font-medium">v2.1.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Обновлено:</span>
              <span className="font-medium">Сегодня</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
