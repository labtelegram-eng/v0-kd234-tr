"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatedFlagLogo } from "@/components/ui/animated-flag-logo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, ChevronDown, User, LogOut, Settings, Globe } from 'lucide-react'

interface SiteUser {
  id: number
  username: string
  role?: string
}

interface SiteHeaderProps {
  user: SiteUser | null
  onLoginToggle: () => void
  isLoginPanelOpen: boolean
  onLogout: () => void
  onLoginPanelClose?: () => void
}

const navItems = [
  { href: "/#destinations", label: "Направления" },
  { href: "/#music", label: "Музыка" },
  { href: "/#video", label: "Видео" },
  { href: "/blog", label: "Блог" },
  { href: "/news", label: "Новости" },
]

export function SiteHeader({
  user = null,
  onLoginToggle = () => {},
  isLoginPanelOpen = false,
  onLogout = () => {},
  onLoginPanelClose = () => {},
}: SiteHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
      return
    }
    // Закрываем панель логина при открытии мобильного меню
    if (isLoginPanelOpen) onLoginPanelClose()
    setIsMobileMenuOpen(true)
  }

  return (
    <header
      className="sticky top-0 z-50 bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-neutral-200"
      role="banner"
    >
      {/* Верхняя тонкая акцентная полоса */}
      <div
        aria-hidden="true"
        className="h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-400"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Основная строка хедера */}
        <div className="flex h-16 items-center justify-between">
          {/* Логотип + название */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="На главную">
            <AnimatedFlagLogo size="sm" />
            <span className="text-lg sm:text-xl font-semibold tracking-tight">
              <span className="text-neutral-900">thai</span>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                portal
              </span>
            </span>
          </Link>

          {/* Навигация — desktop */}
          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2"
            aria-label="Основная навигация"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-2.5 py-2 text-sm lg:text-[15px] text-neutral-700 hover:text-neutral-900 rounded-md transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {/* Переключатель языка */}
            <Button
              variant="outline"
              size="sm"
              className="ml-1 border-neutral-300 text-neutral-700 hover:text-neutral-900 hover:border-neutral-400 bg-transparent"
              aria-label="Выбрать язык"
            >
              <Globe className="mr-2 h-4 w-4" />
              RU
            </Button>
          </nav>

          {/* Профиль / Вход — desktop */}
          <div className="hidden md:flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 rounded-full px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-sm transition-all hover:shadow-md motion-safe:hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:ring-offset-2"
                    aria-label="Меню профиля"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{user.username}</span>
                    <ChevronDown className="w-4 h-4 opacity-90" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center justify-center text-white">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{user.username}</p>
                        <p className="text-xs text-neutral-500">
                          {user.role === "admin" ? "Администратор" : "Пользователь"}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-neutral-500" />
                        <span>Admin панель</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault()
                      // В демо сообщаем, что не реализовано
                      alert("Настройки пока не реализованы")
                    }}
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 text-neutral-500" />
                    <span>Настройки</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault()
                      onLogout()
                    }}
                    className="text-red-600 focus:text-red-700 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={onLoginToggle}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2 ${
                  isLoginPanelOpen
                    ? "bg-neutral-700 hover:bg-neutral-800 text-white"
                    : "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white"
                }`}
                aria-expanded={isLoginPanelOpen}
                aria-controls="login-panel"
              >
                {isLoginPanelOpen ? "Закрыть" : "Войти"}
              </Button>
            )}
          </div>

          {/* Бургер — mobile */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:ring-offset-2"
            aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Мобильное меню */}
        <div
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-neutral-200 py-3">
            <nav className="flex flex-col gap-1" aria-label="Мобильная навигация">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-2 py-2 rounded-md text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="px-2 pt-2 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-neutral-300 text-neutral-700 hover:text-neutral-900 hover:border-neutral-400 bg-transparent"
                  aria-label="Выбрать язык"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  RU
                </Button>
              </div>

              <div className="px-2 pt-3 mt-2 border-t border-neutral-200">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{user.username}</p>
                        <p className="text-xs text-neutral-500">
                          {user.role === "admin" ? "Администратор" : "Пользователь"}
                        </p>
                      </div>
                    </div>

                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="block px-2 py-2 text-sm rounded-md text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin панель
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        onLogout()
                      }}
                      className="block w-full text-left px-2 py-2 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                      Выйти
                    </button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      onLoginToggle()
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-sm hover:shadow-md transition-all"
                    aria-controls="login-panel"
                  >
                    Войти
                  </Button>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
