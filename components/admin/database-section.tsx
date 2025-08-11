"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, Download, Upload, Save, HardDrive, Activity, Clock, CheckCircle, AlertTriangle, BarChart3, FileText, Users, MapPin, Music, Newspaper, Zap, Shield, Server } from 'lucide-react'

interface DatabaseStats {
  totalRecords: number
  destinations: number
  musicTracks: number
  news: number
  blogs: number
  users: number
  lastBackup: string
  dbSize: string
  usagePercentage: number
}

export function DatabaseSection() {
  const [stats, setStats] = useState<DatabaseStats>({
    totalRecords: 0,
    destinations: 0,
    musicTracks: 0,
    news: 0,
    blogs: 0,
    users: 0,
    lastBackup: '',
    dbSize: '0 MB',
    usagePercentage: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadDatabaseStats()
  }, [])

  const loadDatabaseStats = async () => {
    try {
      setIsLoading(true)
      // Симуляция загрузки статистики
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStats({
        totalRecords: 1247,
        destinations: 12,
        musicTracks: 45,
        news: 89,
        blogs: 156,
        users: 3,
        lastBackup: new Date().toISOString(),
        dbSize: '24.7 MB',
        usagePercentage: 68
      })
    } catch (error) {
      setError('Ошибка загрузки статистики базы данных')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDatabase = async () => {
    setIsSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await fetch('/api/database/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        setSuccess('База данных успешно сохранена')
        await loadDatabaseStats()
      } else {
        const data = await response.json()
        setError(data.error || 'Ошибка сохранения базы данных')
      }
    } catch (error) {
      setError('Ошибка сохранения базы данных')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportDatabase = async () => {
    setIsExporting(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await fetch('/api/database/export', {
        method: 'GET'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `database-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setSuccess('База данных успешно экспортирована')
      } else {
        const data = await response.json()
        setError(data.error || 'Ошибка экспорта базы данных')
      }
    } catch (error) {
      setError('Ошибка экспорта базы данных')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportDatabase = async (file: File) => {
    setIsImporting(true)
    setError('')
    setSuccess('')
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/database/import', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        setSuccess('База данных успешно импортирована')
        await loadDatabaseStats()
      } else {
        const data = await response.json()
        setError(data.error || 'Ошибка импорта базы данных')
      }
    } catch (error) {
      setError('Ошибка импорта базы данных')
    } finally {
      setIsImporting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка статистики базы данных...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-3xl"></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
        
        <div className="relative bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Database className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-2">
                Управление базой данных
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                Резервное копирование, экспорт и импорт данных системы
              </p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">Система активна</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Последний бэкап: {stats.lastBackup ? formatDate(stats.lastBackup) : 'Никогда'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Размер БД: {stats.dbSize}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Database Usage Progress */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Использование базы данных</h3>
              <Badge variant="outline" className="bg-white">
                {stats.usagePercentage}% заполнено
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stats.usagePercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Save Database */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 hover:shadow-2xl transition-all duration-300 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
          <CardContent className="relative p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Save className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Сохранить данные</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Создать резервную копию всех данных в системе для обеспечения безопасности
            </p>
            <Button
              onClick={handleSaveDatabase}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить БД
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Export Database */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 hover:shadow-2xl transition-all duration-300 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
          <CardContent className="relative p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Экспорт данных</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Скачать полную копию базы данных в формате JSON для внешнего использования
            </p>
            <Button
              onClick={handleExportDatabase}
              disabled={isExporting}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Экспорт...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Экспорт БД
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Import Database */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 via-violet-50 to-purple-50 hover:shadow-2xl transition-all duration-300 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5"></div>
          <CardContent className="relative p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Импорт данных</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Загрузить и восстановить данные из файла резервной копии
            </p>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImportDatabase(file)
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isImporting}
              />
              <Button
                disabled={isImporting}
                className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3"
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Импорт...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Импорт БД
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium mb-1">Направления</p>
                <p className="text-3xl font-bold text-blue-700">{stats.destinations}</p>
                <Badge className="mt-2 bg-blue-100 text-blue-800 border-0">
                  {stats.destinations > 0 ? 'Активно' : 'Пусто'}
                </Badge>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-7 h-7 text-blue-600" />
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
                <Badge className="mt-2 bg-purple-100 text-purple-800 border-0">
                  {stats.musicTracks > 0 ? 'Активно' : 'Пусто'}
                </Badge>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Music className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium mb-1">Новости</p>
                <p className="text-3xl font-bold text-green-700">{stats.news}</p>
                <Badge className="mt-2 bg-green-100 text-green-800 border-0">
                  {stats.news > 0 ? 'Активно' : 'Пусто'}
                </Badge>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Newspaper className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium mb-1">Блоги</p>
                <p className="text-3xl font-bold text-orange-700">{stats.blogs}</p>
                <Badge className="mt-2 bg-orange-100 text-orange-800 border-0">
                  {stats.blogs > 0 ? 'Активно' : 'Пусто'}
                </Badge>
              </div>
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-7 h-7 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-600 text-sm font-medium mb-1">Пользователи</p>
                <p className="text-3xl font-bold text-cyan-700">{stats.users}</p>
                <Badge className="mt-2 bg-cyan-100 text-cyan-800 border-0">
                  {stats.users > 0 ? 'Активно' : 'Пусто'}
                </Badge>
              </div>
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-50 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Всего записей</p>
                <p className="text-3xl font-bold text-gray-700">{stats.totalRecords}</p>
                <Badge className="mt-2 bg-gray-100 text-gray-800 border-0">
                  Общая статистика
                </Badge>
              </div>
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-7 h-7 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status and Technical Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span>Состояние системы</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-gray-900">База данных</span>
              </div>
              <Badge className="bg-green-100 text-green-800 border-0">Онлайн</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-gray-900">API сервисы</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800 border-0">Активны</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-gray-900">Файловая система</span>
              </div>
              <Badge className="bg-purple-100 text-purple-800 border-0">Доступна</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-slate-600 rounded-xl flex items-center justify-center">
                <Server className="w-5 h-5 text-white" />
              </div>
              <span>Техническая информация</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Версия БД</p>
                <p className="font-bold text-gray-900">v2.1.0</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Тип БД</p>
                <p className="font-bold text-gray-900">JSON</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Кодировка</p>
                <p className="font-bold text-gray-900">UTF-8</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Статус</p>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="font-bold text-green-600">Защищена</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      {error && (
        <Alert className="mt-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mt-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
