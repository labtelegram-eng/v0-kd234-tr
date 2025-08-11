"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import {
  Bell,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  Globe,
  Zap,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  Copy,
  Users,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface PartnerNotification {
  id: number
  title: string
  content: string
  cta_text: string
  cta_url: string
  is_active: boolean
  show_after_seconds: number
  show_on_pages: {
    home: boolean
    blog: boolean
    news: boolean
    destinations: boolean
  }
  limit_shows: boolean
  max_shows_per_session: number
  show_randomly: boolean
  target_scope: "pages" | "specific"
  targeted_news_ids: number[]
  targeted_blog_ids: number[]
  created_at: string
  updated_at: string
}

interface FormData {
  title: string
  content: string
  cta_text: string
  cta_url: string
  show_after_seconds: number
  show_on_pages: {
    home: boolean
    blog: boolean
    news: boolean
    destinations: boolean
  }
  limit_shows: boolean
  max_shows_per_session: number
  show_randomly: boolean
  target_scope: "pages" | "specific"
  targeted_news_ids: number[]
  targeted_blog_ids: number[]
}

const initialFormData: FormData = {
  title: "",
  content: "",
  cta_text: "",
  cta_url: "",
  show_after_seconds: 30,
  show_on_pages: {
    home: true,
    blog: true,
    news: true,
    destinations: true,
  },
  limit_shows: false,
  max_shows_per_session: 1,
  show_randomly: false,
  target_scope: "pages",
  targeted_news_ids: [],
  targeted_blog_ids: [],
}

export default function PartnerNotificationsPage() {
  const { toast } = useToast()

  // State
  const [notifications, setNotifications] = useState<PartnerNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  // Modal state
  const [showEditor, setShowEditor] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [previewNotification, setPreviewNotification] = useState<PartnerNotification | null>(null)

  // Form state
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Test state
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    notification?: PartnerNotification
  } | null>(null)

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/partner-notification", {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Ошибка загрузки уведомлений")
      }

      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error("Error loading notifications:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить уведомления",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Test notification system
  const testNotificationSystem = useCallback(async () => {
    try {
      const response = await fetch("/api/partner-notification/random?page=home", {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Ошибка тестирования системы")
      }

      const data = await response.json()

      if (data.success && data.notification) {
        setTestResult({
          success: true,
          message: "Система работает! Найдено активное уведомление.",
          notification: data.notification,
        })
      } else {
        setTestResult({
          success: false,
          message: "Нет активных уведомлений для главной страницы.",
        })
      }
    } catch (error) {
      console.error("Error testing notification system:", error)
      setTestResult({
        success: false,
        message: "Ошибка при тестировании системы уведомлений.",
      })
    }
  }, [])

  // Load data on mount
  useEffect(() => {
    loadNotifications()
    testNotificationSystem()
  }, [loadNotifications, testNotificationSystem])

  // Validate form
  const validateForm = (data: FormData): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!data.title.trim()) {
      errors.title = "Заголовок обязателен"
    }

    if (!data.content.trim()) {
      errors.content = "Содержание обязательно"
    }

    if (!data.cta_text.trim()) {
      errors.cta_text = "Текст кнопки обязателен"
    }

    if (!data.cta_url.trim()) {
      errors.cta_url = "Ссылка обязательна"
    } else {
      try {
        new URL(data.cta_url)
      } catch {
        if (!data.cta_url.startsWith("/")) {
          errors.cta_url = "Введите корректную ссылку"
        }
      }
    }

    if (data.show_after_seconds < 5 || data.show_after_seconds > 300) {
      errors.show_after_seconds = "Задержка должна быть от 5 до 300 секунд"
    }

    if (data.target_scope === "pages") {
      const hasAnyPage = Object.values(data.show_on_pages).some(Boolean)
      if (!hasAnyPage) {
        errors.show_on_pages = "Выберите хотя бы одну страницу"
      }
    }

    if (data.target_scope === "specific") {
      if (data.targeted_news_ids.length === 0 && data.targeted_blog_ids.length === 0) {
        errors.targeted_content = "Выберите хотя бы одну новость или статью блога"
      }
    }

    return errors
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateForm(formData)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      toast({
        title: "Ошибка валидации",
        description: "Пожалуйста, исправьте ошибки в форме",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      const method = editingId ? "PUT" : "POST"
      const body = editingId ? { id: editingId, ...formData } : formData

      const response = await fetch("/api/partner-notification", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Ошибка сохранения")
      }

      toast({
        title: "Успешно",
        description: editingId ? "Уведомление обновлено" : "Уведомление создано",
      })

      setShowEditor(false)
      setEditingId(null)
      setFormData(initialFormData)
      setFormErrors({})

      await loadNotifications()
      await testNotificationSystem()
    } catch (error: any) {
      console.error("Error saving notification:", error)
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить уведомление",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить это уведомление?")) {
      return
    }

    try {
      const response = await fetch(`/api/partner-notification?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Ошибка удаления")
      }

      toast({
        title: "Успешно",
        description: "Уведомление удалено",
      })

      await loadNotifications()
      await testNotificationSystem()
    } catch (error: any) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить уведомление",
        variant: "destructive",
      })
    }
  }

  // Handle toggle active
  const handleToggleActive = async (notification: PartnerNotification) => {
    try {
      const response = await fetch("/api/partner-notification", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: notification.id,
          is_active: !notification.is_active,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Ошибка обновления статуса")
      }

      toast({
        title: "Успешно",
        description: `Уведомление ${!notification.is_active ? "активировано" : "деактивировано"}`,
      })

      await loadNotifications()
      await testNotificationSystem()
    } catch (error: any) {
      console.error("Error toggling notification:", error)
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось изменить статус",
        variant: "destructive",
      })
    }
  }

  // Open editor for new notification
  const openCreateEditor = () => {
    setEditingId(null)
    setFormData(initialFormData)
    setFormErrors({})
    setShowEditor(true)
  }

  // Open editor for existing notification
  const openEditEditor = (notification: PartnerNotification) => {
    setEditingId(notification.id)
    setFormData({
      title: notification.title,
      content: notification.content,
      cta_text: notification.cta_text,
      cta_url: notification.cta_url,
      show_after_seconds: notification.show_after_seconds,
      show_on_pages: notification.show_on_pages,
      limit_shows: notification.limit_shows,
      max_shows_per_session: notification.max_shows_per_session,
      show_randomly: notification.show_randomly,
      target_scope: notification.target_scope,
      targeted_news_ids: notification.targeted_news_ids || [],
      targeted_blog_ids: notification.targeted_blog_ids || [],
    })
    setFormErrors({})
    setShowEditor(true)
  }

  // Open preview
  const openPreview = (notification: PartnerNotification) => {
    setPreviewNotification(notification)
    setShowPreview(true)
  }

  // Duplicate notification
  const duplicateNotification = (notification: PartnerNotification) => {
    setEditingId(null)
    setFormData({
      title: `${notification.title} (копия)`,
      content: notification.content,
      cta_text: notification.cta_text,
      cta_url: notification.cta_url,
      show_after_seconds: notification.show_after_seconds,
      show_on_pages: notification.show_on_pages,
      limit_shows: notification.limit_shows,
      max_shows_per_session: notification.max_shows_per_session,
      show_randomly: notification.show_randomly,
      target_scope: notification.target_scope,
      targeted_news_ids: notification.targeted_news_ids || [],
      targeted_blog_ids: notification.targeted_blog_ids || [],
    })
    setFormErrors({})
    setShowEditor(true)
  }

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      !searchQuery ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && notification.is_active) ||
      (statusFilter === "inactive" && !notification.is_active)

    return matchesSearch && matchesStatus
  })

  // Statistics
  const stats = {
    total: notifications.length,
    active: notifications.filter((n) => n.is_active).length,
    inactive: notifications.filter((n) => !n.is_active).length,
    onHome: notifications.filter((n) => n.is_active && n.show_on_pages?.home).length,
  }

  // Get page labels
  const getPageLabels = (showOnPages: PartnerNotification["show_on_pages"]) => {
    const labels = []
    if (showOnPages?.home) labels.push("Главная")
    if (showOnPages?.blog) labels.push("Блог")
    if (showOnPages?.news) labels.push("Новости")
    if (showOnPages?.destinations) labels.push("Направления")
    return labels
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка партнерских уведомлений...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Партнерские уведомления</h1>
                  <p className="text-gray-600">Управление всплывающими предложениями для посетителей сайта</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={testNotificationSystem}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Activity className="w-4 h-4" />
                  Тест системы
                </Button>
                <Button
                  onClick={loadNotifications}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <RefreshCw className="w-4 h-4" />
                  Обновить
                </Button>
                <Button
                  onClick={openCreateEditor}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Создать уведомление
                </Button>
              </div>
            </div>

            {/* Test Result */}
            {testResult && (
              <div
                className={`p-4 rounded-lg border ${
                  testResult.success
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {testResult.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="font-medium">{testResult.message}</span>
                </div>
                {testResult.notification && (
                  <div className="mt-2 text-sm">Активное уведомление: "{testResult.notification.title}"</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Всего</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Активных</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Неактивных</p>
                  <p className="text-3xl font-bold text-gray-500">{stats.inactive}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <EyeOff className="w-6 h-6 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">На главной</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.onHome}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle>Фильтры и поиск</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Поиск по заголовку или содержанию..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                      <Filter className="w-4 h-4" />
                      Статус
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>Все ({stats.total})</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                      Активные ({stats.active})
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                      Неактивные ({stats.inactive})
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle>Список уведомлений ({filteredNotifications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? "Уведомления не найдены" : "Нет уведомлений"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery
                    ? "Попробуйте изменить поисковый запрос"
                    : "Создайте первое уведомление для начала работы"}
                </p>
                <Button
                  onClick={openCreateEditor}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Создать уведомление
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                      notification.is_active ? "border-green-200 bg-green-50/50" : "border-gray-200 bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{notification.title}</h3>
                          <Badge
                            variant={notification.is_active ? "default" : "secondary"}
                            className={`px-3 py-1 ${
                              notification.is_active
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                          >
                            {notification.is_active ? "Активно" : "Неактивно"}
                          </Badge>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">{notification.content}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {notification.target_scope === "pages" ? (
                            getPageLabels(notification.show_on_pages).map((label) => (
                              <Badge key={label} variant="outline" className="text-xs">
                                {label}
                              </Badge>
                            ))
                          ) : (
                            <>
                              {notification.targeted_news_ids?.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Новости: {notification.targeted_news_ids.length}
                                </Badge>
                              )}
                              {notification.targeted_blog_ids?.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Блог: {notification.targeted_blog_ids.length}
                                </Badge>
                              )}
                            </>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Показ через {notification.show_after_seconds}с
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {notification.limit_shows
                              ? `${notification.max_shows_per_session}× ${notification.show_randomly ? "случайно" : "всегда"}`
                              : "Без ограничений"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {formatDate(notification.updated_at)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={notification.is_active}
                          onCheckedChange={() => handleToggleActive(notification)}
                        />

                        <Button onClick={() => openPreview(notification)} variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button onClick={() => openEditEditor(notification)} variant="outline" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => duplicateNotification(notification)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Дублировать
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(notification.id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать уведомление" : "Создать уведомление"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Заголовок *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Привлекательный заголовок"
                    className={formErrors.title ? "border-red-500" : ""}
                  />
                  {formErrors.title && <p className="text-sm text-red-600 mt-1">{formErrors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="content">Содержание *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Описание предложения..."
                    rows={4}
                    className={formErrors.content ? "border-red-500" : ""}
                  />
                  {formErrors.content && <p className="text-sm text-red-600 mt-1">{formErrors.content}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cta_text">Текст кнопки *</Label>
                    <Input
                      id="cta_text"
                      value={formData.cta_text}
                      onChange={(e) => setFormData((prev) => ({ ...prev, cta_text: e.target.value }))}
                      placeholder="Узнать больше"
                      className={formErrors.cta_text ? "border-red-500" : ""}
                    />
                    {formErrors.cta_text && <p className="text-sm text-red-600 mt-1">{formErrors.cta_text}</p>}
                  </div>

                  <div>
                    <Label htmlFor="show_after_seconds">Задержка (сек) *</Label>
                    <Input
                      id="show_after_seconds"
                      type="number"
                      min={5}
                      max={300}
                      value={formData.show_after_seconds}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          show_after_seconds: Number.parseInt(e.target.value) || 30,
                        }))
                      }
                      className={formErrors.show_after_seconds ? "border-red-500" : ""}
                    />
                    {formErrors.show_after_seconds && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.show_after_seconds}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="cta_url">Ссылка *</Label>
                  <Input
                    id="cta_url"
                    value={formData.cta_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cta_url: e.target.value }))}
                    placeholder="https://example.com или /internal-page"
                    className={formErrors.cta_url ? "border-red-500" : ""}
                  />
                  {formErrors.cta_url && <p className="text-sm text-red-600 mt-1">{formErrors.cta_url}</p>}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Target Scope */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <Label className="text-sm font-medium mb-3 block">Режим показа</Label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="target_scope"
                        value="pages"
                        checked={formData.target_scope === "pages"}
                        onChange={() => setFormData((prev) => ({ ...prev, target_scope: "pages" }))}
                      />
                      <span className="text-sm">На выбранных страницах</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="target_scope"
                        value="specific"
                        checked={formData.target_scope === "specific"}
                        onChange={() => setFormData((prev) => ({ ...prev, target_scope: "specific" }))}
                      />
                      <span className="text-sm">В конкретных материалах</span>
                    </label>
                  </div>
                </div>

                {/* Pages Selection */}
                {formData.target_scope === "pages" && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <Label className="text-sm font-medium mb-3 block">Страницы для показа</Label>
                    <div className="space-y-3">
                      {[
                        { key: "home", label: "Главная страница" },
                        { key: "blog", label: "Блог" },
                        { key: "news", label: "Новости" },
                        { key: "destinations", label: "Направления" },
                      ].map((page) => (
                        <div key={page.key} className="flex items-center justify-between">
                          <span className="text-sm">{page.label}</span>
                          <Switch
                            checked={formData.show_on_pages[page.key as keyof typeof formData.show_on_pages]}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({
                                ...prev,
                                show_on_pages: {
                                  ...prev.show_on_pages,
                                  [page.key]: checked,
                                },
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                    {formErrors.show_on_pages && (
                      <p className="text-sm text-red-600 mt-2">{formErrors.show_on_pages}</p>
                    )}
                  </div>
                )}

                {/* Specific Content Selection */}
                {formData.target_scope === "specific" && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <Label className="text-sm font-medium mb-3 block">Конкретные материалы</Label>
                    <p className="text-xs text-gray-600 mb-3">
                      Функция в разработке. Пока используйте режим "На выбранных страницах".
                    </p>
                    {formErrors.targeted_content && (
                      <p className="text-sm text-red-600 mt-2">{formErrors.targeted_content}</p>
                    )}
                  </div>
                )}

                {/* Show Limits */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Ограничения показов</Label>
                    <Switch
                      checked={formData.limit_shows}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, limit_shows: checked }))}
                    />
                  </div>

                  {formData.limit_shows && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-600">Максимум за сессию</Label>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={formData.max_shows_per_session}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              max_shows_per_session: Number.parseInt(e.target.value) || 1,
                            }))
                          }
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Случайный показ</span>
                        <Switch
                          checked={formData.show_randomly}
                          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, show_randomly: checked }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button type="button" variant="outline" onClick={() => setShowEditor(false)}>
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingId ? "Сохранить изменения" : "Создать уведомление"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          {previewNotification && (
            <div className="relative">
              <button
                onClick={() => setShowPreview(false)}
                className="absolute right-3 top-3 z-10 rounded-full p-2 text-white/80 hover:text-white hover:bg-white/20 transition"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 pt-12 text-white">
                <h3 className="mb-2 text-xl font-bold pr-8">{previewNotification.title}</h3>
                <p className="text-blue-100">{previewNotification.content}</p>
              </div>

              <div className="p-6">
                <div className="mb-4 flex gap-3">
                  <Button
                    asChild
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                  >
                    <a href={previewNotification.cta_url} target="_blank" rel="noreferrer">
                      {previewNotification.cta_text}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline" onClick={() => setShowPreview(false)}>
                    Закрыть
                  </Button>
                </div>

                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Показ через {previewNotification.show_after_seconds} секунд
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3" />
                    {previewNotification.limit_shows
                      ? `${previewNotification.max_shows_per_session}× ${previewNotification.show_randomly ? "случайно" : "всегда"}`
                      : "Без ограничений"}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {previewNotification.target_scope === "pages" ? (
                      getPageLabels(previewNotification.show_on_pages).map((label) => (
                        <Badge key={label} variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      ))
                    ) : (
                      <>
                        {previewNotification.targeted_news_ids?.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Новости: {previewNotification.targeted_news_ids.length}
                          </Badge>
                        )}
                        {previewNotification.targeted_blog_ids?.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Блог: {previewNotification.targeted_blog_ids.length}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
