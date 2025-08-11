"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, Calendar, Star, Settings, Newspaper, Clock, CheckCircle, BarChart3, TrendingUp } from 'lucide-react'
import { NewsWidgetsSection } from "./news-widgets-section"

interface NewsItem {
  id: number
  title: string
  excerpt: string
  content: string
  image: string
  publishedAt: string
  isActive: boolean
  isFeatured: boolean
  category: string
  createdAt: string
  updatedAt: string
}

interface NewsSectionProps {
  onUpdate: () => void
}

const categories = [
  { id: "tourism", name: "Туризм", color: "bg-blue-100 text-blue-800" },
  { id: "ecology", name: "Экология", color: "bg-green-100 text-green-800" },
  { id: "transport", name: "Транспорт", color: "bg-purple-100 text-purple-800" },
  { id: "investments", name: "Инвестиции", color: "bg-yellow-100 text-yellow-800" },
  { id: "culture", name: "Культура", color: "bg-pink-100 text-pink-800" },
  { id: "police", name: "Полиция", color: "bg-red-100 text-red-800" },
  { id: "investigation", name: "Расследования", color: "bg-orange-100 text-orange-800" },
  { id: "violations", name: "Нарушения", color: "bg-gray-100 text-gray-800" },
  { id: "food", name: "Еда", color: "bg-indigo-100 text-indigo-800" },
  { id: "important", name: "Важное", color: "bg-red-100 text-red-800" },
  { id: "security", name: "Безопасность", color: "bg-red-100 text-red-800" },
]

export function NewsSection({ onUpdate }: NewsSectionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [news, setNews] = useState<NewsItem[]>([])
  const [error, setError] = useState("")
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    image: "",
    category: "tourism",
    isActive: true,
    isFeatured: false,
  })

  useEffect(() => {
    // Симуляция загрузки
    const timer = setTimeout(() => {
      setIsLoading(false)
      loadNews()
    }, 1600)

    return () => clearTimeout(timer)
  }, [])

  const loadNews = async () => {
    try {
      const response = await fetch("/api/news")
      if (response.ok) {
        const data = await response.json()
        setNews(data.news || [])
      } else {
        setError("Ошибка загрузки новостей")
      }
    } catch (error) {
      setError("Ошибка загрузки новостей")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.excerpt || !formData.content) {
      setError("Заполните все обязательные поля")
      return
    }

    try {
      const url = editingNews ? `/api/news/${editingNews.id}` : "/api/news"
      const method = editingNews ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadNews()
        resetForm()
        onUpdate()
      } else {
        const data = await response.json()
        setError(data.error || "Ошибка при сохранении новости")
      }
    } catch (error) {
      setError("Ошибка при сохранении новости")
    }
  }

  const handleEdit = (newsItem: NewsItem) => {
    setEditingNews(newsItem)
    setFormData({
      title: newsItem.title,
      excerpt: newsItem.excerpt,
      content: newsItem.content,
      image: newsItem.image,
      category: newsItem.category,
      isActive: newsItem.isActive,
      isFeatured: newsItem.isFeatured,
    })
    setIsCreating(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту новость?")) return

    try {
      const response = await fetch(`/api/news/${id}`, { method: "DELETE" })
      if (response.ok) {
        await loadNews()
        onUpdate()
      } else {
        setError("Ошибка при удалении новости")
      }
    } catch (error) {
      setError("Ошибка при удалении новости")
    }
  }

  const handleToggleActive = async (newsItem: NewsItem) => {
    try {
      const response = await fetch(`/api/news/${newsItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !newsItem.isActive }),
      })

      if (response.ok) {
        await loadNews()
        onUpdate()
      } else {
        setError("Ошибка при обновлении новости")
      }
    } catch (error) {
      setError("Ошибка при обновлении новости")
    }
  }

  const handleToggleFeatured = async (newsItem: NewsItem) => {
    try {
      const response = await fetch(`/api/news/${newsItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !newsItem.isFeatured }),
      })

      if (response.ok) {
        await loadNews()
        onUpdate()
      } else {
        setError("Ошибка при обновлении новости")
      }
    } catch (error) {
      setError("Ошибка при обновлении новости")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      image: "",
      category: "tourism",
      isActive: true,
      isFeatured: false,
    })
    setEditingNews(null)
    setIsCreating(false)
  }

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId) || categories[0]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка новостей...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50">
      {/* Hero Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-pink-600/10 to-rose-600/10 rounded-3xl"></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-rose-400/20 to-orange-400/20 rounded-full blur-xl"></div>
        
        <div className="relative bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 via-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Newspaper className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-pink-900 bg-clip-text text-transparent mb-2">
                Управление новостями
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                Создавайте и редактируйте новости для сайта
              </p>
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
                  <span className="text-gray-600">Новостей: {news.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="news" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="news" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Новости</span>
          </TabsTrigger>
          <TabsTrigger value="widgets" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Виджеты</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium mb-1">Всего новостей</p>
                    <p className="text-3xl font-bold text-blue-700">{news.length}</p>
                    <p className="text-xs text-blue-500 mt-1">В системе</p>
                  </div>
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-7 h-7 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium mb-1">Опубликованных</p>
                    <p className="text-3xl font-bold text-green-700">{news.filter((n) => n.isActive).length}</p>
                    <p className="text-xs text-green-500 mt-1">Активных</p>
                  </div>
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Eye className="w-7 h-7 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium mb-1">Рекомендуемых</p>
                    <p className="text-3xl font-bold text-yellow-700">{news.filter((n) => n.isFeatured).length}</p>
                    <p className="text-xs text-yellow-500 mt-1">Избранных</p>
                  </div>
                  <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Star className="w-7 h-7 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-50 hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Черновиков</p>
                    <p className="text-3xl font-bold text-gray-700">{news.filter((n) => !n.isActive).length}</p>
                    <p className="text-xs text-gray-500 mt-1">Неопубликованных</p>
                  </div>
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <EyeOff className="w-7 h-7 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add News Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить новость
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
              <Button variant="ghost" size="sm" onClick={() => setError("")} className="mt-2">
                Закрыть
              </Button>
            </div>
          )}

          {/* Create/Edit Form */}
          {isCreating && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{editingNews ? "Редактировать новость" : "Создать новость"}</span>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок *</label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="Введите заголовок новости"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Краткое описание *</label>
                        <Textarea
                          value={formData.excerpt}
                          onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                          placeholder="Краткое описание новости"
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Изображение</label>
                        <Input
                          value={formData.image}
                          onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                          placeholder="URL изображения"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                          />
                          <label className="text-sm font-medium text-gray-700">Опубликовать</label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.isFeatured}
                            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: checked }))}
                          />
                          <label className="text-sm font-medium text-gray-700">Рекомендуемая</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Полный текст *</label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                      placeholder="Полный текст новости"
                      rows={8}
                      required
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingNews ? "Сохранить изменения" : "Создать новость"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Отмена
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* News List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.map((newsItem) => {
              const categoryInfo = getCategoryInfo(newsItem.category)

              return (
                <Card key={newsItem.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={categoryInfo.color}>{categoryInfo.name}</Badge>
                          {newsItem.isFeatured && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              <Star className="w-3 h-3 mr-1" />
                              Рекомендуемая
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{newsItem.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{newsItem.excerpt}</p>
                        <p className="text-xs text-gray-500">{formatDate(newsItem.publishedAt)}</p>
                      </div>
                      <Switch checked={newsItem.isActive} onCheckedChange={() => handleToggleActive(newsItem)} />
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(newsItem)} className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Редактировать
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleFeatured(newsItem)}
                        className={newsItem.isFeatured ? "text-yellow-600 hover:text-yellow-700" : ""}
                      >
                        <Star className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(newsItem.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {news.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Новостей пока нет</h3>
                <p className="text-gray-600 mb-4">Создайте первую новость для вашего сайта</p>
                <Button
                  onClick={() => setIsCreating(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Создать новость
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="widgets">
          <NewsWidgetsSection onUpdate={onUpdate} error={error} setError={setError} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
