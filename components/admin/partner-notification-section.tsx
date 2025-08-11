"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, Bell, Clock, CheckCircle, TrendingUp, BarChart3, Settings, LinkIcon, ToggleLeft, ToggleRight, LayoutDashboard, Newspaper, Landmark, Home } from 'lucide-react'

type ShowOnPages = {
  home: boolean
  blog: boolean
  news: boolean
  destinations: boolean
}

interface PartnerNotificationAPI {
  id: number
  title: string
  content: string
  ctaText: string
  ctaUrl: string
  isActive: boolean
  showAfterSeconds: number
  showOnPages: ShowOnPages
  limitShows: boolean
  maxShowsPerSession: number
  showRandomly: boolean
  createdAt: string
  updatedAt: string
}

interface PartnerNotificationSectionProps {
  onUpdate?: () => void
  error?: string
  setError?: (error: string) => void
}

export function PartnerNotificationSection(props: PartnerNotificationSectionProps) {
  const { onUpdate = () => {}, error: externalError, setError: externalSetError } = props

  // Local error state; we will mirror to external if provided
  const [localError, setLocalError] = useState("")
  const errorMessage = externalError ?? localError
  function reportError(message: string) {
    if (typeof externalSetError === "function") externalSetError(message)
    setLocalError(message)
  }

  const [notifications, setNotifications] = useState<PartnerNotificationAPI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingNotification, setEditingNotification] = useState<PartnerNotificationAPI | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Stats
  const stats = useMemo(() => {
    const total = notifications.length
    const active = notifications.filter((n) => n.isActive).length
    const inactive = total - active
    const avgShow = notifications.length
      ? Math.round(notifications.reduce((sum, n) => sum + (n.showAfterSeconds ?? 0), 0) / notifications.length)
      : 0
    return { total, active, inactive, avgShow }
  }, [notifications])

  // Form state aligned with API
  const [formData, setFormData] = useState<{
    title: string
    content: string
    ctaText: string
    ctaUrl: string
    isActive: boolean
    showAfterSeconds: number
    showOnPages: ShowOnPages
    limitShows: boolean
    maxShowsPerSession: number
    showRandomly: boolean
  }>({
    title: "",
    content: "",
    ctaText: "",
    ctaUrl: "",
    isActive: true,
    showAfterSeconds: 20,
    showOnPages: { home: true, blog: true, news: false, destinations: true },
    limitShows: false,
    maxShowsPerSession: 1,
    showRandomly: false,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      loadNotifications()
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/partner-notification", { cache: "no-store" })
      if (!res.ok) {
        reportError("Ошибка загрузки уведомлений")
        return
      }
      const data = await res.json()
      setNotifications(Array.isArray(data.notifications) ? data.notifications : [])
    } catch {
      reportError("Ошибка загрузки уведомлений")
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      reportError("Укажите заголовок")
      return false
    }
    if (!formData.content.trim()) {
      reportError("Укажите текст уведомления")
      return false
    }
    if (!formData.ctaText.trim()) {
      reportError("Укажите текст кнопки (CTA)")
      return false
    }
    if (!formData.ctaUrl.trim()) {
      reportError("Укажите ссылку для кнопки (CTA URL)")
      return false
    }
    try {
      // Basic URL check
      // Allow both absolute and relative URLs; if absolute, it must be a valid URL
      if (/^https?:\/\//i.test(formData.ctaUrl)) {
        new URL(formData.ctaUrl)
      }
    } catch {
      reportError("Некорректная ссылка в поле CTA URL")
      return false
    }
    return true
  }

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

    if (!validateForm()) return

    try {
      const res = await fetch("/api/partner-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          ctaText: formData.ctaText,
          ctaUrl: formData.ctaUrl,
          showAfterSeconds: Math.max(5, Number(formData.showAfterSeconds) || 20),
          showOnPages: formData.showOnPages,
          limitShows: !!formData.limitShows,
          maxShowsPerSession: Math.max(1, Number(formData.maxShowsPerSession) || 1),
          showRandomly: !!formData.showRandomly,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.success === false) {
        reportError(data?.error || "Ошибка создания уведомления")
        return
      }

      await loadNotifications()
      setShowCreateForm(false)
      resetForm()
      onUpdate()
    } catch {
      reportError("Ошибка создания уведомления")
    }
  }

  const handleUpdateNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")
    if (!editingNotification) return
    if (!validateForm()) return

    try {
      const res = await fetch("/api/partner-notification", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingNotification.id,
          title: formData.title,
          content: formData.content,
          ctaText: formData.ctaText,
          ctaUrl: formData.ctaUrl,
          isActive: formData.isActive,
          showAfterSeconds: Math.max(5, Number(formData.showAfterSeconds) || 20),
          showOnPages: formData.showOnPages,
          limitShows: !!formData.limitShows,
          maxShowsPerSession: Math.max(1, Number(formData.maxShowsPerSession) || 1),
          showRandomly: !!formData.showRandomly,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.success === false) {
        reportError(data?.error || "Ошибка обновления уведомления")
        return
      }

      await loadNotifications()
      setEditingNotification(null)
      resetForm()
      onUpdate()
    } catch {
      reportError("Ошибка обновления уведомления")
    }
  }

  const handleDeleteNotification = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить это уведомление?")) return
    setLocalError("")
    try {
      // API reads id from query (?id=), not from JSON body
      const res = await fetch(`/api/partner-notification?id=${encodeURIComponent(String(id))}`, {
        method: "DELETE",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.success === false) {
        reportError(data?.error || "Ошибка удаления уведомления")
        return
      }
      await loadNotifications()
      onUpdate()
    } catch {
      reportError("Ошибка удаления уведомления")
    }
  }

  const handleToggleStatus = async (notification: PartnerNotificationAPI) => {
    setLocalError("")
    try {
      const res = await fetch("/api/partner-notification", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notification.id, isActive: !notification.isActive }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.success === false) {
        reportError(data?.error || "Ошибка изменения статуса")
        return
      }
      await loadNotifications()
      onUpdate()
    } catch {
      reportError("Ошибка изменения статуса")
    }
  }

  const startEdit = (n: PartnerNotificationAPI) => {
    setEditingNotification(n)
    setFormData({
      title: n.title,
      content: n.content,
      ctaText: n.ctaText,
      ctaUrl: n.ctaUrl,
      isActive: n.isActive,
      showAfterSeconds: n.showAfterSeconds ?? 20,
      showOnPages: {
        home: n.showOnPages?.home ?? true,
        blog: n.showOnPages?.blog ?? true,
        news: n.showOnPages?.news ?? false,
        destinations: n.showOnPages?.destinations ?? true,
      },
      limitShows: n.limitShows ?? false,
      maxShowsPerSession: n.maxShowsPerSession ?? 1,
      showRandomly: n.showRandomly ?? false,
    })
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      ctaText: "",
      ctaUrl: "",
      isActive: true,
      showAfterSeconds: 20,
      showOnPages: { home: true, blog: true, news: false, destinations: true },
      limitShows: false,
      maxShowsPerSession: 1,
      showRandomly: false,
    })
  }

  const cancelEdit = () => {
    setShowCreateForm(false)
    setEditingNotification(null)
    resetForm()
    reportError("")
  }

  const filteredNotifications = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return notifications
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.ctaText.toLowerCase().includes(q) ||
        n.ctaUrl.toLowerCase().includes(q),
    )
  }, [notifications, searchTerm])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка партнерских уведомлений...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Hero Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-red-600/10 to-pink-600/10 rounded-3xl"></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-xl"></div>

        <div className="relative bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Bell className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-red-900 bg-clip-text text-transparent mb-2">
                Партнерские уведомления
              </h1>
              <p className="text-gray-600 text-lg mb-4">Управление уведомлениями для партнеров и пользователей</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">Система активна</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Обновлено: сегодня</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Уведомлений: {notifications.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium mb-1">Всего уведомлений</p>
                <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
                <p className="text-xs text-blue-500 mt-1">В системе</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Bell className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium mb-1">Активных</p>
                <p className="text-3xl font-bold text-green-700">{stats.active}</p>
                <p className="text-xs text-green-500 mt-1">Отображаются</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium mb-1">Неактивных</p>
                <p className="text-3xl font-bold text-purple-700">{stats.inactive}</p>
                <p className="text-xs text-purple-500 mt-1">Скрыто</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <EyeOff className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium mb-1">Средняя задержка</p>
                <p className="text-3xl font-bold text-orange-700">{stats.avgShow}с</p>
                <p className="text-xs text-orange-500 mt-1">до показа</p>
              </div>
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-lg">
          <p className="text-red-700 font-medium">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Create Button */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => {
              setShowCreateForm(true)
              setEditingNotification(null)
              resetForm()
              setLocalError("")
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={showCreateForm || editingNotification !== null}
          >
            <Plus className="w-4 h-4 mr-2" />
            Создать уведомление
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Страницы показа:</span>
            <Home className="w-4 h-4" />
            <Newspaper className="w-4 h-4" />
            <LayoutDashboard className="w-4 h-4" />
            <Landmark className="w-4 h-4" />
          </div>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Поиск по заголовку, тексту, CTA..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button variant="outline" onClick={loadNotifications}>
                Обновить список
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Form */}
        {(showCreateForm || editingNotification) && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {editingNotification ? "Редактировать уведомление" : "Создать новое уведомление"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingNotification ? handleUpdateNotification : handleCreateNotification} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Заголовок *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Введите заголовок"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Задержка показа (сек)</label>
                    <input
                      type="number"
                      min={5}
                      max={300}
                      value={formData.showAfterSeconds}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, showAfterSeconds: Math.max(5, Number(e.target.value) || 20) }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Текст уведомления *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Введите текст"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Текст кнопки (CTA) *</label>
                    <input
                      type="text"
                      value={formData.ctaText}
                      onChange={(e) => setFormData((prev) => ({ ...prev, ctaText: e.target.value }))}
                      placeholder="Например: Узнать больше"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ссылка (CTA URL) *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-500">
                        <LinkIcon className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={formData.ctaUrl}
                        onChange={(e) => setFormData((prev) => ({ ...prev, ctaUrl: e.target.value }))}
                        placeholder="https://example.com или /internal/page"
                        className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">
                      Активировать уведомление
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="limitShows"
                      checked={formData.limitShows}
                      onChange={(e) => setFormData((prev) => ({ ...prev, limitShows: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="limitShows" className="text-sm font-medium">
                      Ограничить количество показов за сессию
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Максимум показов за сессию</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formData.maxShowsPerSession}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, maxShowsPerSession: Math.max(1, Number(e.target.value) || 1) }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!formData.limitShows}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    {formData.showRandomly ? (
                      <ToggleRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                    <label className="text-sm font-medium">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={formData.showRandomly}
                        onChange={(e) => setFormData((prev) => ({ ...prev, showRandomly: e.target.checked }))}
                      />
                      Показывать случайно (если включено ограничение)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Показывать на страницах</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.showOnPages.home}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, showOnPages: { ...prev.showOnPages, home: e.target.checked } }))
                        }
                      />
                      <Home className="w-4 h-4 text-gray-600" />
                      <span>Главная</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.showOnPages.blog}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, showOnPages: { ...prev.showOnPages, blog: e.target.checked } }))
                        }
                      />
                      <Newspaper className="w-4 h-4 text-gray-600" />
                      <span>Блог</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.showOnPages.news}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, showOnPages: { ...prev.showOnPages, news: e.target.checked } }))
                        }
                      />
                      <LayoutDashboard className="w-4 h-4 text-gray-600" />
                      <span>Новости</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.showOnPages.destinations}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            showOnPages: { ...prev.showOnPages, destinations: e.target.checked },
                          }))
                        }
                      />
                      <Landmark className="w-4 h-4 text-gray-600" />
                      <span>Направления</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-green-500 hover:bg-green-600">
                    <Save className="w-4 h-4 mr-2" />
                    {editingNotification ? "Обновить" : "Создать"}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    <X className="w-4 h-4 mr-2" />
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((n) => (
            <Card
              key={n.id}
              className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                        <Bell className="w-4 h-4" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{n.title}</h3>
                      <Badge variant={n.isActive ? "default" : "secondary"} className="px-3 py-1 rounded-full text-xs">
                        {n.isActive ? "Активно" : "Неактивно"}
                      </Badge>
                    </div>

                    <p className="text-gray-600 mb-3 leading-relaxed line-clamp-3">{n.content}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Показ через:</span> {n.showAfterSeconds}s
                      </div>
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-gray-500" />
                        <span className="truncate">
                          <span className="font-medium">{n.ctaText}:</span> {n.ctaUrl}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Лимит показов:</span>{" "}
                        {n.limitShows ? `${n.maxShowsPerSession} за сессию` : "нет"}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {n.showOnPages?.home && <Badge variant="outline">Главная</Badge>}
                      {n.showOnPages?.blog && <Badge variant="outline">Блог</Badge>}
                      {n.showOnPages?.news && <Badge variant="outline">Новости</Badge>}
                      {n.showOnPages?.destinations && <Badge variant="outline">Направления</Badge>}
                      {n.showRandomly && <Badge className="bg-amber-100 text-amber-800">Случайно</Badge>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-6">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(n)}
                      className={`${n.isActive ? "text-green-600 hover:text-green-700" : "text-gray-600 hover:text-gray-700"}`}
                      title={n.isActive ? "Скрыть" : "Показать"}
                    >
                      {n.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(n)}
                      disabled={showCreateForm || editingNotification !== null}
                      title="Редактировать"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteNotification(n.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={showCreateForm || editingNotification !== null}
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredNotifications.length === 0 && (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Уведомления не найдены</h3>
                <p className="text-gray-600">
                  {searchTerm ? "Попробуйте изменить поисковый запрос" : "Создайте первое уведомление для партнеров"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
