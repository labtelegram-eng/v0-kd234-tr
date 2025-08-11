"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown, User, LogOut, Settings, Menu, X } from 'lucide-react'
import { AnimatedFlagLogo } from "@/components/ui/animated-flag-logo"

interface AdminHeaderProps {
  user?: {
    id: number
    username: string
    role?: string
  } | null
  onLogout?: () => void
}

export function AdminHeader({ user, onLogout }: AdminHeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Логотип и название */}
          <Link href="/" className="flex items-center space-x-3">
            <AnimatedFlagLogo size="sm" />
            <span className="text-base sm:text-lg font-semibold text-gray-900">Путеводитель по Таиланду</span>
          </Link>

          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Навигация для десктопа */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <Link href="/#destinations" className="text-gray-700 hover:text-gray-900 text-sm lg:text-base">
                Направления
              </Link>
              <Link href="/#music" className="text-gray-700 hover:text-gray-900 text-sm lg:text-base">
                Музыка
              </Link>
              <Link href="/#video" className="text-gray-700 hover:text-gray-900 text-sm lg:text-base">
                Видео
              </Link>
              <Link href="/blog" className="text-gray-700 hover:text-gray-900 text-sm lg:text-base">
                Blog
              </Link>
              <Link href="/news" className="text-gray-700 hover:text-gray-900 text-sm lg:text-base">
                Новости
              </Link>
              <button className="text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 text-sm lg:text-base px-3 py-1 rounded bg-transparent">
                RU
              </button>
            </nav>

            {/* Меню пользователя */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full px-4 py-2 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">{user.username}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-white/80 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Выпадающее меню */}
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.username}</p>
                            <p className="text-xs text-gray-500">
                              {user.role === "admin" ? "Администратор" : "Пользователь"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          <span>Admin панель</span>
                        </Link>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            alert("Настройки пока не реализованы")
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          <span>Настройки</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            onLogout?.()
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          <span>Выйти</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button className="hidden md:block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 bg-blue-500 hover:bg-blue-600 text-white">
                Войти
              </button>
            )}

            {/* Мобильное меню */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Открыть мобильное меню"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Мобильное меню */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/#destinations"
                className="text-gray-700 hover:text-gray-900 px-2 py-1 transform transition-all duration-200 hover:translate-x-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Направления
              </Link>
              <Link
                href="/#music"
                className="text-gray-700 hover:text-gray-900 px-2 py-1 transform transition-all duration-200 hover:translate-x-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Музыка
              </Link>
              <Link
                href="/#video"
                className="text-gray-700 hover:text-gray-900 px-2 py-1 transform transition-all duration-200 hover:translate-x-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Видео
              </Link>
              <Link
                href="/blog"
                className="text-gray-700 hover:text-gray-900 px-2 py-1 transform transition-all duration-200 hover:translate-x-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/news"
                className="text-gray-700 hover:text-gray-900 px-2 py-1 transform transition-all duration-200 hover:translate-x-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Новости
              </Link>
              <div className="px-2 py-1">
                <button className="text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 bg-transparent transition-all duration-200 text-sm px-3 py-1 rounded">
                  RU
                </button>
              </div>
              
              {/* Мобильное меню пользователя */}
              <div className="px-2 py-1 mt-2 pt-3 border-t border-gray-200">
                {user ? (
                  <div className="space-y-2 animate-in fade-in duration-300">
                    <div className="flex items-center space-x-3 px-2 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="text-xs text-gray-500">
                          {user.role === "admin" ? "Администратор" : "Пользователь"}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/admin"
                      className="block px-2 py-2 text-gray-700 hover:text-gray-900 text-sm transition-all duration-200 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin панель
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        onLogout?.()
                      }}
                      className="block w-full text-left px-2 py-2 text-red-600 hover:text-red-700 text-sm transition-all duration-200 hover:bg-red-50 rounded-md"
                    >
                      Выйти
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 px-4 py-2 rounded-lg"
                  >
                    Войти
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
