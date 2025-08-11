"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, ArrowUpDown, MapPin, Upload, ImageIcon, Clock, CheckCircle, BarChart3, TrendingUp } from 'lucide-react'
import Image from "next/image"

interface Destination {
  id: number
  name: string
  image: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface DestinationsSectionProps {
  destinations: Destination[]
  onUpdate: () => void
  onFileUpload: (file: File) => Promise<string | null>
  isUploading: boolean
  error: string
  setError: (error: string) => void
}

export function DestinationsSection({
  destinations,
  onUpdate,
  onFileUpload,
  isUploading,
  error,
  setError,
}: DestinationsSectionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({ name: "", image: "" })
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false)
  const [selectedDestinationForReorder, setSelectedDestinationForReorder] = useState<Destination | null>(null)
  const [newPosition, setNewPosition] = useState<number>(1)

  useEffect(() => {
    // Симуляция загрузки
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  const handleCreate = async () => {
    if (!formData.name || !formData.image) {
      setError("Заполните все поля")
      return
    }

    try {
      const response = await fetch("/api/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          image: formData.image,
        }),
      })

      if (response.ok) {
        onUpdate()
        setIsCreating(false)
        setFormData({ name: "", image: "" })
        setError("")
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch (error) {
      setError("Ошибка создания направления")
    }
  }

  const handleUpdate = async (id: number) => {
    if (!formData.name || !formData.image) {
      setError("Заполните все поля")
      return
    }

    try {
      const response = await fetch(`/api/destinations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          image: formData.image,
        }),
      })

      if (response.ok) {
        onUpdate()
        setEditingId(null)
        setFormData({ name: "", image: "" })
        setError("")
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch (error) {
      setError("Ошибка обновления направления")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить это направление?")) return

    try {
      const response = await fetch(`/api/destinations/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onUpdate()
        setError("")
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch (error) {
      setError("Ошибка удаления направления")
    }
  }

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/destinations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      setError("Ошибка изменения статуса")
    }
  }

  const startEdit = (destination: Destination) => {
    setEditingId(destination.id)
    setFormData({
      name: destination.name,
      image: destination.image,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setFormData({ name: "", image: "" })
    setError("")
  }

  const openPositionModal = (destination: Destination) => {
    setSelectedDestinationForReorder(destination)
    setNewPosition(destination.order)
    setIsPositionModalOpen(true)
  }

  const closePositionModal = () => {
    setIsPositionModalOpen(false)
    setSelectedDestinationForReorder(null)
    setNewPosition(1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка направлений...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Hero Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-cyan-600/10 rounded-3xl"></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-xl"></div>
        
        <div className="relative bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-900 bg-clip-text text-transparent mb-2">
                Популярные направления
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                Управление туристическими направлениями на сайте
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
                  <span className="text-gray-600">Всего: {destinations.length}</span>
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
                <p className="text-blue-600 text-sm font-medium mb-1">Всего направлений</p>
                <p className="text-3xl font-bold text-blue-700">{destinations.length}</p>
                <p className="text-xs text-blue-500 mt-1">Общее количество</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium mb-1">Активных</p>
                <p className="text-3xl font-bold text-green-700">{destinations.filter(d => d.isActive).length}</p>
                <p className="text-xs text-green-500 mt-1">Показываются на сайте</p>
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
                <p className="text-3xl font-bold text-orange-700">{destinations.filter(d => !d.isActive).length}</p>
                <p className="text-xs text-orange-500 mt-1">Не отображаются</p>
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
                <p className="text-xs text-purple-500 mt-1">Рост трафика</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Button */}
      <div className="flex justify-end mb-8">
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-6 py-3 rounded-xl"
          disabled={isCreating || editingId !== null}
        >
          <Plus className="w-5 h-5 mr-2" />
          Добавить направление
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        {isCreating && (
          <Card className="border-2 border-dashed border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-emerald-700 mb-2">Новое направление</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Название</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="Название направления"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Изображение</label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const imagePath = await onFileUpload(file)
                        if (imagePath) {
                          setFormData((prev) => ({ ...prev, image: imagePath }))
                        }
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <div className="flex items-center space-x-2 text-emerald-600">
                      <Upload className="w-4 h-4 animate-bounce" />
                      <p className="text-sm">Загрузка изображения...</p>
                    </div>
                  )}
                  {formData.image && (
                    <div className="relative">
                      <img
                        src={formData.image || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-xl shadow-md"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleCreate}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isUploading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </Button>
                <Button 
                  onClick={cancelEdit} 
                  variant="outline" 
                  className="flex-1 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Destination Cards */}
        {destinations.map((destination) => (
          <Card
            key={destination.id}
            className={`overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 ${
              !destination.isActive ? "opacity-60" : ""
            }`}
          >
            <CardContent className="p-0">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={destination.image || "/placeholder.svg"}
                  alt={destination.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                {/* Status and Position */}
                <div className="absolute top-3 left-3 flex space-x-2">
                  <Badge className="bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                    #{destination.order}
                  </Badge>
                </div>
                
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleToggleActive(destination.id, destination.isActive)}
                    className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                      destination.isActive 
                        ? "bg-green-500/80 hover:bg-green-600/80" 
                        : "bg-gray-500/80 hover:bg-gray-600/80"
                    } text-white shadow-lg hover:shadow-xl`}
                  >
                    {destination.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>

                {/* Name at bottom */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-bold text-white text-lg drop-shadow-lg">{destination.name}</h3>
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-white to-gray-50">
                {editingId === destination.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const imagePath = await onFileUpload(file)
                            if (imagePath) {
                              setFormData((prev) => ({ ...prev, image: imagePath }))
                            }
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        disabled={isUploading}
                      />
                      {isUploading && (
                        <div className="flex items-center space-x-2 text-emerald-600 mt-2">
                          <Upload className="w-4 h-4 animate-bounce" />
                          <p className="text-sm">Загрузка изображения...</p>
                        </div>
                      )}
                      {formData.image && (
                        <div className="mt-3">
                          <img
                            src={formData.image || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-24 object-cover rounded-xl shadow-md"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleUpdate(destination.id)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        size="sm"
                        disabled={isUploading}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Сохранить
                      </Button>
                      <Button 
                        onClick={cancelEdit} 
                        variant="outline" 
                        className="flex-1 border-gray-300 hover:bg-gray-50 transition-all duration-200" 
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => startEdit(destination)}
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                        disabled={editingId !== null || isCreating}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Изменить
                      </Button>
                      <Button
                        onClick={() => openPositionModal(destination)}
                        variant="outline"
                        size="sm"
                        className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                        disabled={editingId !== null || isCreating}
                      >
                        <ArrowUpDown className="w-4 h-4 mr-1" />
                        Позиция
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleDelete(destination.id)}
                      variant="outline"
                      size="sm"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
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
      {isPositionModalOpen && selectedDestinationForReorder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-violet-50">
              <h2 className="text-2xl font-bold text-gray-900">Изменить позицию направления</h2>
              <p className="text-gray-600 mt-1">Выберите новую позицию для "{selectedDestinationForReorder.name}"</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedDestinationForReorder.image || "/placeholder.svg"}
                      alt={selectedDestinationForReorder.name}
                      className="w-16 h-16 object-cover rounded-xl shadow-md"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{selectedDestinationForReorder.name}</h3>
                      <p className="text-sm text-gray-600">Текущая позиция: #{selectedDestinationForReorder.order}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-4">Новая позиция:</label>
                <div className="grid grid-cols-3 gap-3">
                  {destinations.map((dest, index) => {
                    const position = index + 1
                    const isCurrentPosition = dest.id === selectedDestinationForReorder.id
                    const isSelected = newPosition === position

                    return (
                      <button
                        key={position}
                        onClick={() => setNewPosition(position)}
                        disabled={isCurrentPosition}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          isCurrentPosition
                            ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                            : isSelected
                              ? "border-purple-500 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 shadow-lg transform scale-105"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:transform hover:scale-105"
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-bold text-lg mb-1">#{position}</div>
                          <div className="text-xs truncate">{isCurrentPosition ? "Текущая" : dest.name}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={closePositionModal}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={newPosition === selectedDestinationForReorder.order}
                >
                  Применить изменения
                </Button>
                <Button 
                  onClick={closePositionModal} 
                  variant="outline" 
                  className="flex-1 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
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
