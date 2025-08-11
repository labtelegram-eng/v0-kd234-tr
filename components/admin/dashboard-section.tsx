"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, MapPin, Music, Newspaper, PenTool, TrendingUp, Activity, Globe, Calendar, Clock, CheckCircle2, ArrowUpRight, Eye, Settings } from 'lucide-react'

interface DashboardSectionProps {
  stats: {
    destinations: number
    musicTracks: number
    blogs: number
    news: number
  }
  onSectionChange: (section: string) => void
}

export function DashboardSection({ stats, onSectionChange }: DashboardSectionProps) {
  const quickActions = [
    {
      id: "destinations",
      title: "Управление направлениями",
      description: "Добавить или изменить туристические направления",
      icon: MapPin,
      color: "from-emerald-500 to-teal-600",
      bgColor: "from-emerald-50 to-teal-50",
    },
    {
      id: "homepage",
      title: "Настройка главной страницы",
      description: "Изменить контент и слайды главной страницы",
      icon: Globe,
      color: "from-orange-500 to-red-600",
      bgColor: "from-orange-50 to-red-50",
    },
    {
      id: "news",
      title: "Управление новостями",
      description: "Создать или отредактировать новости",
      icon: Newspaper,
      color: "from-cyan-500 to-blue-600",
      bgColor: "from-cyan-50 to-blue-50",
    },
    {
      id: "blogs",
      title: "Управление блогами",
      description: "Добавить новые статьи в блог",
      icon: PenTool,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
    },
  ]

  const systemStats = [
    {
      label: "Активные пользователи",
      value: "1,234",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      label: "Просмотры страниц",
      value: "45,678",
      change: "+8%",
      changeType: "positive" as const,
      icon: Eye,
    },
    {
      label: "Время на сайте",
      value: "3:42",
      change: "+15%",
      changeType: "positive" as const,
      icon: Clock,
    },
    {
      label: "Конверсия",
      value: "2.4%",
      change: "-2%",
      changeType: "negative" as const,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-3xl"></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-xl"></div>
        
        <div className="relative bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent mb-1">
                Панель управления
              </h1>
              <p className="text-gray-600 text-base mb-3">
                Добро пожаловать в административную панель путеводителя по Таиланду
              </p>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">Система активна</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Последнее обновление: сегодня</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Все системы работают</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium mb-1">Направления</p>
                <p className="text-3xl font-bold text-emerald-700">{stats.destinations}</p>
                <p className="text-xs text-emerald-500 mt-1">Туристических мест</p>
              </div>
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium mb-1">Музыкальные треки</p>
                <p className="text-3xl font-bold text-purple-700">{stats.musicTracks}</p>
                <p className="text-xs text-purple-500 mt-1">Аудио файлов</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Music className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-600 text-sm font-medium mb-1">Новости</p>
                <p className="text-3xl font-bold text-cyan-700">{stats.news}</p>
                <p className="text-xs text-cyan-500 mt-1">Опубликованных статей</p>
              </div>
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Newspaper className="w-7 h-7 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium mb-1">Блоги</p>
                <p className="text-3xl font-bold text-green-700">{stats.blogs}</p>
                <p className="text-xs text-green-500 mt-1">Записей в блоге</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <PenTool className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Card
                  key={action.id}
                  className={`border-0 shadow-lg bg-gradient-to-br ${action.bgColor} hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105`}
                  onClick={() => onSectionChange(action.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                        <div className="flex items-center text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                          <span>Перейти</span>
                          <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Analytics */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Аналитика системы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded-full ${
                        stat.changeType === "positive"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
