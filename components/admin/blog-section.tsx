"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, EyeOff, BookOpen, FileText, Clock, CheckCircle, BarChart3, TrendingUp, Settings } from 'lucide-react'

interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  image: string
  category: string
  slug: string
  publishedAt: string
  readTime: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  isActive: boolean
  order: number
}

interface BlogSectionProps {
  onUpdate: () => void
  onFileUpload: (file: File) => Promise<string | null>
  isUploading: boolean
  error: string
  setError: (error: string) => void
}

export function BlogSection({ onUpdate, onFileUpload, isUploading, error, setError }: BlogSectionProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Статистика
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    avgReadTime: 0,
  })

  // Форма создания/редактирования
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    image: "",
    category: "",
    readTime: 5,
    isActive: true,
  })

  useEffect(() => {
    // Симуляция загрузки
    const timer = setTimeout(() => {
      setIsLoading(false)
      loadPosts()
    }, 1300)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    calculateStats()
  }, [posts])

  const loadPosts = async () => {
    try {
      const response = await fetch("/api/blog/posts?includeInactive=true")
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
        setCategories(data.categories || [])
      } else {
        setError("Ошибка загрузки статей")
      }
    } catch (error) {
      setError("Ошибка загрузки статей")
    }
  }

  const calculateStats = () => {
    const total = posts.length
    const published = posts.filter((p) => p.isActive).length
    const drafts = total - published
    const avgReadTime = posts.length > 0 ? Math.round(posts.reduce((sum, p) => sum + p.readTime, 0) / posts.length) : 0

    setStats({ total, published, drafts, avgReadTime })
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.excerpt || !formData.content || !formData.category) {
      setError("Заполните все обязательные поля")
      return
    }

    try {
      const response = await fetch("/api/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadPosts()
        setShowCreateForm(false)
        resetForm()
        onUpdate()
      } else {
        const data = await response.json()
        setError(data.error || "Ошибка создания статьи")
      }
    } catch (error) {
      setError("Ошибка создания статьи")
    }
  }

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingPost) return

    try {
      const response = await fetch(`/api/blog/posts/${editingPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadPosts()
        setEditingPost(null)
        resetForm()
        onUpdate()
      } else {
        const data = await response.json()
        setError(data.error || "Ошибка обновления статьи")
      }
    } catch (error) {
      setError("Ошибка обновления статьи")
    }
  }

  const handleDeletePost = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту статью?")) return

    try {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadPosts()
        onUpdate()
      } else {
        const data = await response.json()
        setError(data.error || "Ошибка удаления статьи")
      }
    } catch (error) {
      setError("Ошибка удаления статьи")
    }
  }

  const handleToggleStatus = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/blog/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !post.isActive }),
      })

      if (response.ok) {
        await loadPosts()
        onUpdate()
      } else {
        setError("Ошибка изменения статуса")
      }
    } catch (error) {
      setError("Ошибка изменения статуса")
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const imagePath = await onFileUpload(file)
    if (imagePath) {
      setFormData((prev) => ({ ...prev, image: imagePath }))
    }
  }

  const startEdit = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image,
      category: post.category,
      readTime: post.readTime,
      isActive: post.isActive,
    })
  }

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      image: "",
      category: "",
      readTime: 5,
      isActive: true,
    })
  }

  const cancelEdit = () => {
    setShowCreateForm(false)
    setEditingPost(null)
    resetForm()
    setError("")
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      culture: "bg-purple-100 text-purple-800",
      travel: "bg-blue-100 text-blue-800",
      food: "bg-orange-100 text-orange-800",
      tips: "bg-green-100 text-green-800",
      history: "bg-red-100 text-red-800",
      nature: "bg-emerald-100 text-emerald-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || categoryId
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка блога...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-3xl"></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
        
        <div className="relative bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent mb-2">
                Управление блогом
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                Создавайте и управляйте статьями блога
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
                  <span className="text-gray-600">Статей: {posts.length}</span>
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
                <p className="text-blue-600 text-sm font-medium mb-1">Всего статей</p>
                <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
                <p className="text-xs text-blue-500 mt-1">В блоге</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium mb-1">Опубликовано</p>
                <p className="text-3xl font-bold text-green-700">{stats.published}</p>
                <p className="text-xs text-green-500 mt-1">Активных</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium mb-1">Черновики</p>
                <p className="text-3xl font-bold text-orange-700">{stats.drafts}</p>
                <p className="text-xs text-orange-500 mt-1">Неопубликованных</p>
              </div>
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-7 h-7 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium mb-1">Среднее время чтения</p>
                <p className="text-3xl font-bold text-purple-700">{stats.avgReadTime} мин</p>
                <p className="text-xs text-purple-500 mt-1">На статью</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-lg">
          <p className="text-red-700 font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={() => setError("")} className="mt-2">
            Закрыть
          </Button>
        </div>
      )}

      <div className="space-y-8">
        {/* Create Button */}
        <div className="flex justify-between items-center">
          <Button 
            onClick={() => setShowCreateForm(true)} 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={showCreateForm || editingPost !== null}
          >
            <Plus className="w-4 h-4 mr-2" />
            Создать статью
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Поиск статей..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  size="sm"
                >
                  Все
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    size="sm"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Form */}
        {(showCreateForm || editingPost) && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {editingPost ? "Редактировать статью" : "Создать новую статью"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingPost ? handleUpdatePost : handleCreatePost} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Заголовок *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Введите заголовок статьи"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Категория *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Краткое описание *</label>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Краткое описание статьи"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Содержание *</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Полное содержание статьи (поддерживается Markdown)"
                    rows={10}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Изображение</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isUploading}
                    />
                    {formData.image && (
                      <img
                        src={formData.image || "/placeholder.svg"}
                        alt="Preview"
                        className="mt-2 w-32 h-20 object-cover rounded"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Время чтения (мин)</label>
                    <Input
                      type="number"
                      value={formData.readTime}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, readTime: Number.parseInt(e.target.value) || 5 }))
                      }
                      min="1"
                      max="60"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Опубликовать статью
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isUploading} className="bg-green-500 hover:bg-green-600">
                    {editingPost ? "Обновить" : "Создать"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEdit}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
                      <Badge className={`px-3 py-1 rounded-full text-xs ${getCategoryColor(post.category)}`}>
                        {getCategoryName(post.category)}
                      </Badge>
                      <Badge variant={post.isActive ? "default" : "secondary"} className="px-3 py-1 rounded-full text-xs">
                        {post.isActive ? "Опубликовано" : "Черновик"}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Время чтения:</span> {post.readTime} мин
                      </div>
                      <div>
                        <span className="font-medium">Создано:</span> {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                      {post.updatedAt !== post.createdAt && (
                        <div>
                          <span className="font-medium">Обновлено:</span> {new Date(post.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <Button size="sm" variant="outline" onClick={() => handleToggleStatus(post)}>
                      {post.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => startEdit(post)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPosts.length === 0 && (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Статьи не найдены</h3>
                <p className="text-gray-600">
                  {searchTerm || selectedCategory !== "all"
                    ? "Попробуйте изменить критерии поиска"
                    : "Создайте первую статью для блога"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
