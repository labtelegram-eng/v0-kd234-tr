"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, ExternalLink, ArrowUpDown, Music, Clock, CheckCircle, BarChart3, TrendingUp } from 'lucide-react'
import Image from "next/image"

interface MusicTrack {
  id: number
  name: string
  artist: string
  coverImage: string
  youtubeUrl: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface MusicSectionProps {
  onUpdate: () => void
  onFileUpload: (file: File) => Promise<string | null>
  isUploading: boolean
  error: string
  setError: (error: string) => void
}

export function MusicSection({ onUpdate, onFileUpload, isUploading, error, setError }: MusicSectionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    coverImage: "",
    youtubeUrl: "",
  })
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false)
  const [selectedTrackForReorder, setSelectedTrackForReorder] = useState<MusicTrack | null>(null)
  const [newPosition, setNewPosition] = useState<number>(1)

  useEffect(() => {
    // Симуляция загрузки
    const timer = setTimeout(() => {
      setIsLoading(false)
      loadMusicTracks()
    }, 1400)

    return () => clearTimeout(timer)
  }, [])

  const loadMusicTracks = async () => {
    try {
      const response = await fetch("/api/music-tracks")
      if (response.ok) {
        const data = await response.json()
        setMusicTracks(data.tracks)
      }
    } catch (error) {
      setError("Ошибка загрузки музыкальных треков")
    }
  }

  // Функция извлечения YouTube ID
  const extractYouTubeId = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return match ? match[1] : ""
  }

  // Функция получения превью YouTube
  const getYouTubeThumbnail = (url: string): string => {
    const videoId = extractYouTubeId(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "/placeholder.svg"
  }

  const getTrackCover = (track: MusicTrack): string => {
    if (track.coverImage && track.coverImage !== "/placeholder.svg") {
      return track.coverImage
    }
    return getYouTubeThumbnail(track.youtubeUrl) || "/placeholder.svg?height=300&width=400&text=Music+Cover"
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.artist || !formData.youtubeUrl) {
      setError("Заполните обязательные поля: название, исполнитель и YouTube URL")
      return
    }

    // Проверяем валидность YouTube URL
    if (!extractYouTubeId(formData.youtubeUrl)) {
      setError("Введите корректную ссылку на YouTube видео")
      return
    }

    try {
      const response = await fetch("/api/music-tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          artist: formData.artist,
          coverImage: formData.coverImage || getYouTubeThumbnail(formData.youtubeUrl),
          youtubeUrl: formData.youtubeUrl,
        }),
      })

      if (response.ok) {
        await loadMusicTracks()
        onUpdate()
        setIsCreating(false)
        setFormData({ name: "", artist: "", coverImage: "", youtubeUrl: "" })
        setError("")
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch (error) {
      setError("Ошибка создания трека")
    }
  }

  const handleUpdate = async (id: number) => {
    if (!formData.name || !formData.artist || !formData.youtubeUrl) {
      setError("Заполните обязательные поля")
      return
    }

    if (!extractYouTubeId(formData.youtubeUrl)) {
      setError("Введите корректную ссылку на YouTube видео")
      return
    }

    try {
      const response = await fetch(`/api/music-tracks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          artist: formData.artist,
          coverImage: formData.coverImage || getYouTubeThumbnail(formData.youtubeUrl),
          youtubeUrl: formData.youtubeUrl,
        }),
      })

      if (response.ok) {
        await loadMusicTracks()
        onUpdate()
        setEditingId(null)
        setFormData({ name: "", artist: "", coverImage: "", youtubeUrl: "" })
        setError("")
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch (error) {
      setError("Ошибка обновления трека")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот трек?")) return

    try {
      const response = await fetch(`/api/music-tracks/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadMusicTracks()
        onUpdate()
        setError("")
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch (error) {
      setError("Ошибка удаления трека")
    }
  }

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/music-tracks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        await loadMusicTracks()
        onUpdate()
      }
    } catch (error) {
      setError("Ошибка изменения статуса")
    }
  }

  const startEdit = (track: MusicTrack) => {
    setEditingId(track.id)
    setFormData({
      name: track.name,
      artist: track.artist,
      coverImage: track.coverImage,
      youtubeUrl: track.youtubeUrl,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setFormData({ name: "", artist: "", coverImage: "", youtubeUrl: "" })
    setError("")
  }

  const openPositionModal = (track: MusicTrack) => {
    setSelectedTrackForReorder(track)
    setNewPosition(track.order)
    setIsPositionModalOpen(true)
  }

  const closePositionModal = () => {
    setIsPositionModalOpen(false)
    setSelectedTrackForReorder(null)
    setNewPosition(1)
  }

  const handlePositionChange = async () => {
    if (!selectedTrackForReorder || newPosition === selectedTrackForReorder.order) {
      closePositionModal()
      return
    }

    try {
      const response = await fetch(`/api/music-tracks/${selectedTrackForReorder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newPosition }),
      })

      if (response.ok) {
        await loadMusicTracks()
        onUpdate()
        closePositionModal()
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch (error) {
      setError("Ошибка изменения позиции")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка музыкальных треков...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50">
      {/* Hero Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-violet-600/10 to-pink-600/10 rounded-3xl"></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-xl"></div>
        
        <div className="relative bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-violet-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Music className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-violet-900 bg-clip-text text-transparent mb-2">
                Тайская музыка
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                Управление музыкальными треками. Превью автоматически загружаются из YouTube.
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
                  <span className="text-gray-600">Треков: {musicTracks.length}</span>
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
                <p className="text-blue-600 text-sm font-medium mb-1">Всего треков</p>
                <p className="text-3xl font-bold text-blue-700">{musicTracks.length}</p>
                <p className="text-xs text-blue-500 mt-1">В коллекции</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Music className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium mb-1">Активных</p>
                <p className="text-3xl font-bold text-green-700">{musicTracks.filter(t => t.isActive).length}</p>
                <p className="text-xs text-green-500 mt-1">Отображаются</p>
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
                <p className="text-orange-600 text-sm font-medium mb-1">Скрытых</p>
                <p className="text-3xl font-bold text-orange-700">{musicTracks.filter(t => !t.isActive).length}</p>
                <p className="text-xs text-orange-500 mt-1">Не показываются</p>
              </div>
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <EyeOff className="w-7 h-7 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium mb-1">Популярность</p>
                <p className="text-sm font-bold text-purple-700">Высокая</p>
                <p className="text-xs text-purple-500 mt-1">Рост прослушиваний</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end mb-6">
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg"
          disabled={isCreating || editingId !== null}
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить трек
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        {isCreating && (
          <Card className="border-2 border-dashed border-purple-300 bg-purple-50/50">
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg text-purple-700 font-semibold">Новый трек</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название трека <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Название трека"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Исполнитель <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) => setFormData((prev) => ({ ...prev, artist: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Имя исполнителя"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {formData.youtubeUrl && extractYouTubeId(formData.youtubeUrl) && (
                  <div className="mt-2">
                    <img
                      src={getYouTubeThumbnail(formData.youtubeUrl) || "/placeholder.svg"}
                      alt="YouTube Preview"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <p className="text-xs text-green-600 mt-1">✓ Превью загружено из YouTube</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Обложка</label>
                <div className="space-y-3">
                  {/* Загрузка файла */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Загрузить файл:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const imagePath = await onFileUpload(file)
                          if (imagePath) {
                            setFormData((prev) => ({ ...prev, coverImage: imagePath }))
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={isUploading}
                    />
                    {isUploading && <p className="text-sm text-purple-600">Загрузка изображения...</p>}
                  </div>

                  {/* Или прямая ссылка */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Или введите прямую ссылку (.jpg, .png):</label>
                    <input
                      type="url"
                      value={formData.coverImage}
                      onChange={(e) => setFormData((prev) => ({ ...prev, coverImage: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Превью */}
                  {formData.coverImage && (
                    <div className="mt-2">
                      <img
                        src={formData.coverImage || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=300&width=400&text=Image+Error"
                        }}
                      />
                    </div>
                  )}

                  {/* Автоматическое превью YouTube */}
                  {formData.youtubeUrl && extractYouTubeId(formData.youtubeUrl) && !formData.coverImage && (
                    <div className="mt-2">
                      <img
                        src={getYouTubeThumbnail(formData.youtubeUrl) || "/placeholder.svg"}
                        alt="YouTube Preview"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <p className="text-xs text-green-600 mt-1">✓ Будет использовано превью из YouTube</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Если обложка не указана, будет автоматически использовано превью из YouTube
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleCreate}
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

        {/* Existing Tracks */}
        {musicTracks.map((track) => (
          <Card key={track.id} className={`${!track.isActive ? "opacity-60" : ""} hover:shadow-lg transition-shadow`}>
            <CardContent className="p-0">
              <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                <Image
                  src={getTrackCover(track) || "/placeholder.svg"}
                  alt={track.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=300&width=400&text=Music+Cover"
                  }}
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => handleToggleActive(track.id, track.isActive)}
                    className={`p-2 rounded-full ${
                      track.isActive ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"
                    } text-white shadow-lg`}
                  >
                    {track.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                  YouTube
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full">
                  #{track.order}
                </div>
                {track.youtubeUrl && (
                  <a
                    href={track.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 p-2 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <div className="p-4">
                {editingId === track.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Название трека"
                    />
                    <input
                      type="text"
                      value={formData.artist}
                      onChange={(e) => setFormData((prev) => ({ ...prev, artist: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Исполнитель"
                    />
                    <input
                      type="url"
                      value={formData.youtubeUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="YouTube URL"
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleUpdate(track.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        size="sm"
                        disabled={isUploading}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Сохранить
                      </Button>
                      <Button onClick={cancelEdit} variant="outline" className="flex-1 bg-transparent" size="sm">
                        <X className="w-4 h-4 mr-1" />
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{track.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{track.artist}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => startEdit(track)}
                        variant="outline"
                        size="sm"
                        disabled={editingId !== null || isCreating}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Изменить
                      </Button>
                      <Button
                        onClick={() => openPositionModal(track)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        disabled={editingId !== null || isCreating}
                      >
                        <ArrowUpDown className="w-4 h-4 mr-1" />
                        Позиция
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleDelete(track.id)}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={editingId !== null || isCreating}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Удалить
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Position Modal */}
      {isPositionModalOpen && selectedTrackForReorder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Изменить позицию трека</h2>
              <p className="text-gray-600 mt-1">Выберите новую позицию для "{selectedTrackForReorder.name}"</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        selectedTrackForReorder.coverImage || getYouTubeThumbnail(selectedTrackForReorder.youtubeUrl)
                      }
                      alt={selectedTrackForReorder.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedTrackForReorder.name}</h3>
                      <p className="text-sm text-gray-600">{selectedTrackForReorder.artist}</p>
                      <p className="text-sm text-gray-500">Текущая позиция: #{selectedTrackForReorder.order}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Новая позиция:</label>
                <div className="grid grid-cols-3 gap-2">
                  {musicTracks.map((track, index) => {
                    const position = index + 1
                    const isCurrentPosition = track.id === selectedTrackForReorder.id
                    const isSelected = newPosition === position

                    return (
                      <button
                        key={position}
                        onClick={() => setNewPosition(position)}
                        disabled={isCurrentPosition}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isCurrentPosition
                            ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                            : isSelected
                              ? "border-purple-500 bg-purple-50 text-purple-700"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-semibold text-sm">#{position}</div>
                          <div className="text-xs mt-1 truncate">{isCurrentPosition ? "Текущая" : track.name}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handlePositionChange}
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                  disabled={newPosition === selectedTrackForReorder.order}
                >
                  Применить изменения
                </Button>
                <Button onClick={closePositionModal} variant="outline" className="flex-1 bg-transparent">
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
