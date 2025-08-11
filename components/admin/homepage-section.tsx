"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, ExternalLink, Home, Clock, CheckCircle, Video, ImageIcon, BarChart3, TrendingUp, Link, Upload, ChevronUp, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react'
import Image from "next/image"

interface HeroSlide {
  id: number
  image: string
  alt: string
  order: number
  isActive: boolean
}

interface HomePageSettings {
  id: number
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  slides: HeroSlide[]
  updatedAt: string
}

interface CultureVideo {
  id: number
  title: string
  description: string
  youtubeUrl: string
  thumbnail: string
  isActive: boolean
}

interface HomepageSectionProps {
  onFileUpload: (file: File) => Promise<string | null>
  isUploading: boolean
  error: string
  setError: (error: string) => void
}

export function HomepageSection({ onFileUpload, isUploading, error, setError }: HomepageSectionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [homeSettings, setHomeSettings] = useState<HomePageSettings>({
    id: 1,
    heroTitle: "",
    heroSubtitle: "",
    heroButtonText: "",
    slides: [],
    updatedAt: "",
  })
  const [cultureVideo, setCultureVideo] = useState<CultureVideo | null>(null)
  const [isEditingHero, setIsEditingHero] = useState(false)
  const [isEditingVideo, setIsEditingVideo] = useState(false)
  const [isCreatingSlide, setIsCreatingSlide] = useState(false)
  const [editingSlideId, setEditingSlideId] = useState<number | null>(null)
  const [imageInputMethod, setImageInputMethod] = useState<'upload' | 'url'>('upload')
  const [heroForm, setHeroForm] = useState({
    heroTitle: "",
    heroSubtitle: "",
    heroButtonText: "",
  })
  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
    thumbnail: "",
    isActive: true,
  })
  const [slideForm, setSlideForm] = useState({
    image: "",
    alt: "",
  })

  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    // Симуляция загрузки
    const timer = setTimeout(() => {
      setIsLoading(false)
      loadHomeSettings()
      loadCultureVideo()
    }, 1300)

    return () => clearTimeout(timer)
  }, [])

  const loadHomeSettings = async () => {
    try {
      const response = await fetch("/api/home-settings")
      if (response.ok) {
        const data = await response.json()
        setHomeSettings(data.settings)
        setHeroForm({
          heroTitle: data.settings.heroTitle || "",
          heroSubtitle: data.settings.heroSubtitle || "",
          heroButtonText: data.settings.heroButtonText || "",
        })
      }
    } catch (error) {
      setError("Ошибка загрузки настроек главной страницы")
    }
  }

  const loadCultureVideo = async () => {
    try {
      const response = await fetch("/api/culture-video")
      if (response.ok) {
        const data = await response.json()
        setCultureVideo(data.video)
        if (data.video) {
          setVideoForm({
            title: data.video.title || "",
            description: data.video.description || "",
            youtubeUrl: data.video.youtubeUrl || "",
            thumbnail: data.video.thumbnail || "",
            isActive: data.video.isActive || false,
          })
        }
      }
    } catch (error) {
      setError("Ошибка загрузки видео о культуре")
    }
  }

  const handleUpdateHero = async () => {
    try {
      const response = await fetch("/api/home-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(heroForm),
      })

      if (response.ok) {
        await loadHomeSettings()
        setIsEditingHero(false)
        setError("")
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch (error) {
      setError("Ошибка обновления главного блока")
    }
  }

  const handleUpdateVideo = async () => {
    try {
      const response = await fetch("/api/culture-video", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoForm),
      })

      if (response.ok) {
        await loadCultureVideo()
        setIsEditingVideo(false)
        setError("")
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch (error) {
      setError("Ошибка обновления видео")
    }
  }

  const handleCreateSlide = async () => {
    if (!slideForm.image || !slideForm.alt) {
      setError("Заполните все поля")
      return
    }

    try {
      const response = await fetch("/api/hero-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slideForm),
      })

      if (response.ok) {
        await loadHomeSettings()
        setIsCreatingSlide(false)
        setSlideForm({ image: "", alt: "" })
        setImageInputMethod('upload')
        setError("")
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch (error) {
      setError("Ошибка создания слайда")
    }
  }

  const handleUpdateSlide = async (id: number) => {
    if (!slideForm.image || !slideForm.alt) {
      setError("Заполните все поля")
      return
    }

    try {
      const response = await fetch(`/api/hero-slides/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slideForm),
      })

      if (response.ok) {
        await loadHomeSettings()
        setEditingSlideId(null)
        setSlideForm({ image: "", alt: "" })
        setImageInputMethod('upload')
        setError("")
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch (error) {
      setError("Ошибка обновления слайда")
    }
  }

  const handleDeleteSlide = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот слайд?")) return

    try {
      const response = await fetch(`/api/hero-slides/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadHomeSettings()
        setError("")
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch (error) {
      setError("Ошибка удаления слайда")
    }
  }

  const handleToggleSlideActive = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/hero-slides/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        await loadHomeSettings()
      }
    } catch (error) {
      setError("Ошибка изменения статуса слайда")
    }
  }

  // Новые функции для изменения порядка слайдов
  const handleMoveSlideUp = async (id: number) => {
    const currentSlide = homeSettings.slides.find(s => s.id === id)
    if (!currentSlide || currentSlide.order === 1) return

    const targetSlide = homeSettings.slides.find(s => s.order === currentSlide.order - 1)
    if (!targetSlide) return

    try {
      // Обновляем порядок текущего слайда
      await fetch(`/api/hero-slides/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: currentSlide.order - 1 }),
      })

      // Обновляем порядок целевого слайда
      await fetch(`/api/hero-slides/${targetSlide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: targetSlide.order + 1 }),
      })

      await loadHomeSettings()
    } catch (error) {
      setError("Ошибка изменения порядка слайда")
    }
  }

  const handleMoveSlideDown = async (id: number) => {
    const currentSlide = homeSettings.slides.find(s => s.id === id)
    if (!currentSlide || currentSlide.order === homeSettings.slides.length) return

    const targetSlide = homeSettings.slides.find(s => s.order === currentSlide.order + 1)
    if (!targetSlide) return

    try {
      // Обновляем порядок текущего слайда
      await fetch(`/api/hero-slides/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: currentSlide.order + 1 }),
      })

      // Обновляем порядок целевого слайда
      await fetch(`/api/hero-slides/${targetSlide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: targetSlide.order - 1 }),
      })

      await loadHomeSettings()
    } catch (error) {
      setError("Ошибка изменения порядка слайда")
    }
  }

  const startEditSlide = (slide: HeroSlide) => {
    setEditingSlideId(slide.id)
    setSlideForm({
      image: slide.image || "",
      alt: slide.alt || "",
    })
    // Определяем метод ввода на основе URL
    setImageInputMethod(slide.image && slide.image.startsWith('http') ? 'url' : 'upload')
  }

  const cancelEdit = () => {
    setIsEditingHero(false)
    setIsEditingVideo(false)
    setIsCreatingSlide(false)
    setEditingSlideId(null)
    setSlideForm({ image: "", alt: "" })
    setImageInputMethod('upload')
    setError("")
  }

  const extractYouTubeId = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return match ? match[1] : ""
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка главной страницы...</p>
          </div>
        </div>
      </div>
    )
  }

  // Сортируем слайды по порядку для отображения
  const sortedSlides = [...homeSettings.slides].sort((a, b) => a.order - b.order)

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
                <Home className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-red-900 bg-clip-text text-transparent mb-2">
                Главная страница
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                Управление контентом главной страницы сайта
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
                  <span className="text-gray-600">Слайдов: {homeSettings.slides.length}</span>
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
                <p className="text-blue-600 text-sm font-medium mb-1">Всего слайдов</p>
                <p className="text-3xl font-bold text-blue-700">{homeSettings.slides.length}</p>
                <p className="text-xs text-blue-500 mt-1">В карусели</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ImageIcon className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium mb-1">Активных слайдов</p>
                <p className="text-3xl font-bold text-green-700">{homeSettings.slides.filter(s => s.isActive).length}</p>
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
                <p className="text-purple-600 text-sm font-medium mb-1">Видео о культуре</p>
                <p className="text-3xl font-bold text-purple-700">{cultureVideo ? 1 : 0}</p>
                <p className="text-xs text-purple-500 mt-1">Настроено</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Video className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium mb-1">Статус видео</p>
                <p className="text-sm font-bold text-orange-700">{cultureVideo?.isActive ? 'Активно' : 'Неактивно'}</p>
                <p className="text-xs text-orange-500 mt-1">На сайте</p>
              </div>
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Toggle */}
      <div className="flex justify-end mb-8">
        <Button
          onClick={() => setShowPreview(!showPreview)}
          variant="outline"
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {showPreview ? "Скрыть предпросмотр" : "Показать предпросмотр"}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Preview Section */}
      {showPreview && (
        <Card className="mb-8 border-2 border-green-200 bg-gradient-to-br from-green-50/30 to-emerald-50/30 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Eye className="w-5 h-5" />
              <span>Предпросмотр главной страницы</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Hero Section Preview */}
              <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 md:h-96 mb-6">
                {homeSettings.slides.filter((slide) => slide.isActive).length > 0 ? (
                  <div className="relative h-full">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${sortedSlides.filter((slide) => slide.isActive)[0]?.image}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white px-4">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
                          {homeSettings.heroTitle}
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto">
                          {homeSettings.heroSubtitle}
                        </p>
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base md:text-lg">
                          {homeSettings.heroButtonText}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
                        {homeSettings.heroTitle}
                      </h1>
                      <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto">
                        {homeSettings.heroSubtitle}
                      </p>
                      <Button className="bg-white text-blue-600 px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base md:text-lg hover:bg-gray-100">
                        {homeSettings.heroButtonText}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        {/* Hero Section Settings */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Главный блок (Hero Section)</span>
              <Button onClick={() => setIsEditingHero(true)} variant="outline" size="sm" disabled={isEditingHero}>
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingHero ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                  <input
                    type="text"
                    value={heroForm.heroTitle}
                    onChange={(e) => setHeroForm((prev) => ({ ...prev, heroTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Заголовок главного блока"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Подзаголовок</label>
                  <textarea
                    value={heroForm.heroSubtitle}
                    onChange={(e) => setHeroForm((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Описание главного блока"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Текст кнопки</label>
                  <input
                    type="text"
                    value={heroForm.heroButtonText}
                    onChange={(e) => setHeroForm((prev) => ({ ...prev, heroButtonText: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Текст кнопки"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleUpdateHero} className="bg-green-500 hover:bg-green-600">
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить
                  </Button>
                  <Button onClick={cancelEdit} variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Текущие настройки:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p>
                      <strong>Заголовок:</strong> {homeSettings.heroTitle}
                    </p>
                    <p>
                      <strong>Подзаголовок:</strong> {homeSettings.heroSubtitle}
                    </p>
                    <p>
                      <strong>Текст кнопки:</strong> {homeSettings.heroButtonText}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hero Slides Management */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Слайды главного блока</span>
              <Button
                onClick={() => setIsCreatingSlide(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={isCreatingSlide || editingSlideId !== null}
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить слайд
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Create Form */}
              {isCreatingSlide && (
                <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg text-blue-700 font-semibold flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Новый слайд
                    </h3>

                    {/* Image Input Method Toggle */}
                    <div className="flex gap-2 mb-4">
                      <Button
                        type="button"
                        variant={imageInputMethod === 'upload' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setImageInputMethod('upload')}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Загрузить файл
                      </Button>
                      <Button
                        type="button"
                        variant={imageInputMethod === 'url' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setImageInputMethod('url')}
                        className="flex items-center gap-2"
                      >
                        <Link className="w-4 h-4" />
                        Ссылка на изображение
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {imageInputMethod === 'upload' ? 'Загрузить изображение' : 'Ссылка на изображение'}
                      </label>
                      <div className="space-y-2">
                        {imageInputMethod === 'upload' ? (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const imagePath = await onFileUpload(file)
                                if (imagePath) {
                                  setSlideForm((prev) => ({ ...prev, image: imagePath }))
                                }
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isUploading}
                          />
                        ) : (
                          <input
                            type="url"
                            value={slideForm.image}
                            onChange={(e) => setSlideForm((prev) => ({ ...prev, image: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/image.jpg или /hero/image.jpg"
                          />
                        )}
                        {isUploading && <p className="text-sm text-blue-600">Загрузка изображения...</p>}
                        {slideForm.image && (
                          <div className="mt-2">
                            <img
                              src={slideForm.image || "/placeholder.svg"}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                      <input
                        type="text"
                        value={slideForm.alt}
                        onChange={(e) => setSlideForm((prev) => ({ ...prev, alt: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Описание изображения"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={handleCreateSlide}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        disabled={isUploading}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Сохранить
                      </Button>
                      <Button onClick={cancelEdit} variant="outline" className="flex-1 bg-transparent">
                        <X className="w-4 h-4 mr-2" />
                        Отмена
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Existing Slides - Column Layout with Order Controls */}
              <div className="space-y-4">
                {sortedSlides.map((slide, index) => (
                  <Card
                    key={slide.id}
                    className={`${!slide.isActive ? "opacity-60" : ""} hover:shadow-lg transition-all duration-300 border-l-4 ${
                      slide.isActive ? "border-l-green-500" : "border-l-gray-300"
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center gap-4 p-4">
                        {/* Order Controls */}
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <Button
                            onClick={() => handleMoveSlideUp(slide.id)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={slide.order === 1 || editingSlideId !== null || isCreatingSlide}
                            title="Переместить вверх"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <div className="text-xs text-center font-medium text-gray-500 bg-gray-100 rounded px-2 py-1">
                            {slide.order}
                          </div>
                          <Button
                            onClick={() => handleMoveSlideDown(slide.id)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={slide.order === homeSettings.slides.length || editingSlideId !== null || isCreatingSlide}
                            title="Переместить вниз"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Image Preview */}
                        <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                          <Image 
                            src={slide.image || "/placeholder.svg"} 
                            alt={slide.alt} 
                            fill 
                            className="object-cover" 
                          />
                          <div className="absolute top-1 left-1 bg-black/70 text-white text-xs font-medium px-1.5 py-0.5 rounded">
                            #{slide.order}
                          </div>
                        </div>

                        {/* Slide Info */}
                        <div className="flex-1 min-w-0">
                          {editingSlideId === slide.id ? (
                            <div className="space-y-3">
                              {/* Image Input Method Toggle for Edit */}
                              <div className="flex gap-2 mb-2">
                                <Button
                                  type="button"
                                  variant={imageInputMethod === 'upload' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setImageInputMethod('upload')}
                                  className="flex items-center gap-1 text-xs px-2 py-1"
                                >
                                  <Upload className="w-3 h-3" />
                                  Файл
                                </Button>
                                <Button
                                  type="button"
                                  variant={imageInputMethod === 'url' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setImageInputMethod('url')}
                                  className="flex items-center gap-1 text-xs px-2 py-1"
                                >
                                  <Link className="w-3 h-3" />
                                  Ссылка
                                </Button>
                              </div>

                              {imageInputMethod === 'upload' ? (
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      const imagePath = await onFileUpload(file)
                                      if (imagePath) {
                                        setSlideForm((prev) => ({ ...prev, image: imagePath }))
                                      }
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  disabled={isUploading}
                                />
                              ) : (
                                <input
                                  type="url"
                                  value={slideForm.image}
                                  onChange={(e) => setSlideForm((prev) => ({ ...prev, image: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="https://example.com/image.jpg"
                                />
                              )}
                              {isUploading && <p className="text-sm text-blue-600">Загрузка изображения...</p>}
                              <input
                                type="text"
                                value={slideForm.alt}
                                onChange={(e) => setSlideForm((prev) => ({ ...prev, alt: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Описание изображения"
                              />
                            </div>
                          ) : (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-1">{slide.alt}</h3>
                              <p className="text-sm text-gray-500 truncate">{slide.image}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    slide.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {slide.isActive ? "Активен" : "Неактивен"}
                                </Badge>
                                <Badge variant="outline" className="px-2 py-1 rounded-full text-xs">
                                  Позиция: {slide.order}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {editingSlideId === slide.id ? (
                            <>
                              <Button
                                onClick={() => handleUpdateSlide(slide.id)}
                                className="bg-green-500 hover:bg-green-600"
                                size="sm"
                                disabled={isUploading}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button onClick={cancelEdit} variant="outline" size="sm">
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => handleToggleSlideActive(slide.id, slide.isActive)}
                                variant="outline"
                                size="sm"
                                className={`${
                                  slide.isActive ? "text-green-600 hover:text-green-700" : "text-gray-600 hover:text-gray-700"
                                }`}
                              >
                                {slide.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </Button>
                              <Button
                                onClick={() => startEditSlide(slide)}
                                variant="outline"
                                size="sm"
                                disabled={editingSlideId !== null || isCreatingSlide}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteSlide(slide.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={editingSlideId !== null || isCreatingSlide}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {homeSettings.slides.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Слайды не добавлены</p>
                    <p className="text-sm">Нажмите "Добавить слайд" чтобы создать первый слайд</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Culture Video Settings */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Видео о тайской культуре</span>
              <Button onClick={() => setIsEditingVideo(true)} variant="outline" size="sm" disabled={isEditingVideo}>
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingVideo ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
                  <input
                    type="text"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Название видео"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                  <textarea
                    value={videoForm.description}
                    onChange={(e) => setVideoForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Описание видео"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={videoForm.youtubeUrl}
                      onChange={(e) => setVideoForm((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    {videoForm.youtubeUrl && (
                      <a
                        href={videoForm.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-500 hover:text-blue-600"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="videoActive"
                    checked={videoForm.isActive}
                    onChange={(e) => setVideoForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="videoActive" className="text-sm font-medium text-gray-700">
                    Показывать видео на сайте
                  </label>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleUpdateVideo} className="bg-green-500 hover:bg-green-600">
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить
                  </Button>
                  <Button onClick={cancelEdit} variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {cultureVideo ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Текущие настройки:</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p>
                          <strong>Название:</strong> {cultureVideo.title}
                        </p>
                        <p>
                          <strong>Описание:</strong> {cultureVideo.description}
                        </p>
                        <p>
                          <strong>YouTube URL:</strong>
                          {cultureVideo.youtubeUrl ? (
                            <a
                              href={cultureVideo.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-600 ml-2"
                            >
                              Открыть <ExternalLink className="w-4 h-4 inline ml-1" />
                            </a>
                          ) : (
                            <span className="text-gray-500 ml-2">Не указан</span>
                          )}
                        </p>
                        <p>
                          <strong>Статус:</strong>
                          <Badge
                            className={`ml-2 px-2 py-1 rounded-full text-xs ${
                              cultureVideo.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {cultureVideo.isActive ? "Активно" : "Неактивно"}
                          </Badge>
                        </p>
                      </div>
                    </div>

                    {cultureVideo.youtubeUrl && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Предпросмотр:</h3>
                        <div className="relative rounded-lg overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
                          <iframe
                            src={`https://www.youtube.com/embed/${extractYouTubeId(cultureVideo.youtubeUrl)}`}
                            title={cultureVideo.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Видео не настроено</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
