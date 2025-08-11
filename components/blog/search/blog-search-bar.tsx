"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Search, ArrowRight, MapPin, X, Menu, FileText, Info, Calendar } from "lucide-react"
import { searchSuggestions, type SearchSuggestion, typeLabels, typeColors } from "./blog-search-suggestions"

interface BlogSearchBarProps {
  searchQuery: string
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

const typeIcons = {
  visa: <FileText className="w-4 h-4" />,
  useful: <Info className="w-4 h-4" />,
  interesting: <Calendar className="w-4 h-4" />,
  city: <MapPin className="w-4 h-4" />,
}

export function BlogSearchBar({
  searchQuery,
  onSearch,
  placeholder = "Поиск по Таиланду для русских...",
  className = "",
}: BlogSearchBarProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Закрытие dropdown при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setIsFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Prevent body scroll when mobile dropdown is open
  useEffect(() => {
    if (isMobile && isDropdownOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobile, isDropdownOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(localQuery)
    setIsDropdownOpen(false)
    setIsFocused(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value)
    // Поиск в реальном времени с задержкой
    setTimeout(() => {
      onSearch(e.target.value)
    }, 300)
  }

  const handleInputFocus = () => {
    setIsFocused(true)
    if (isMobile) {
      setIsDropdownOpen(true)
    }
  }

  const handleInputClick = () => {
    setIsFocused(true)
    setIsDropdownOpen(true)
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.id === "close") {
      setIsDropdownOpen(false)
      setIsFocused(false)
      return
    }

    setLocalQuery(suggestion.query)
    onSearch(suggestion.query)
    setIsDropdownOpen(false)
    setIsFocused(false)
    inputRef.current?.blur()
  }

  const handleClearSearch = () => {
    setLocalQuery("")
    onSearch("")
    inputRef.current?.focus()
  }

  const handleMenuClick = () => {
    setIsDropdownOpen(true)
    setIsFocused(true)
  }

  // Группировка предложений по типам
  const groupedSuggestions = searchSuggestions.reduce(
    (acc, suggestion) => {
      if (!acc[suggestion.type]) {
        acc[suggestion.type] = []
      }
      acc[suggestion.type].push(suggestion)
      return acc
    },
    {} as Record<string, SearchSuggestion[]>,
  )

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div
          className="relative flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-white/20 overflow-hidden transition-all duration-500 hover:shadow-xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            boxShadow: isHovered
              ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 4px rgba(139, 92, 246, 0.5)"
              : isFocused
                ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Search Icon */}
          <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full ml-1">
            <Search className="text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onClick={handleInputClick}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 sm:py-4 text-base sm:text-lg bg-transparent focus:outline-none text-gray-900 placeholder-gray-500"
            style={{ outline: "none", boxShadow: "none" }}
          />

          {/* Clear Button */}
          {localQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 transition-colors duration-200 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              type="button"
              onClick={handleMenuClick}
              className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 text-gray-400 hover:text-gray-600 transition-colors duration-200 mr-1"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Submit Button - Hidden on mobile when menu button is shown */}
          {!isMobile && (
            <button
              type="submit"
              className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 text-white font-medium rounded-full mr-1 transition-all duration-500 hover:scale-105 active:scale-95 group relative overflow-hidden"
              style={{
                background: isHovered
                  ? "linear-gradient(to right, rgb(139, 92, 246), rgb(147, 51, 234))"
                  : "linear-gradient(to right, rgb(16, 185, 129), rgb(20, 184, 166))",
                boxShadow: isHovered
                  ? "0 10px 15px -3px rgba(139, 92, 246, 0.25)"
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-full" />

              {/* Icon with position change */}
              <ArrowRight
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-500 relative z-10 ${
                  isHovered ? "-rotate-45 scale-110 -translate-y-1" : "group-hover:-rotate-45 group-hover:scale-110"
                }`}
              />

              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-full bg-white/20 scale-0 transition-transform duration-300 group-active:scale-100" />
            </button>
          )}
        </div>
      </form>

      {/* Mobile Full-Screen Dropdown */}
      {isMobile && (
        <div
          className={`fixed inset-0 bg-white z-[9999] transition-all duration-300 ease-out ${
            isDropdownOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Search className="w-5 h-5 text-emerald-600" />
                  Навигатор по Таиланду
                </h3>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">Выберите раздел для поиска</p>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                {Object.entries(groupedSuggestions).map(([type, typeSuggestions]) => (
                  <div key={type} className="space-y-3">
                    {/* Mobile Category Header */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-lg">{typeIcons[type as keyof typeof typeIcons]}</div>
                        {typeLabels[type as keyof typeof typeLabels]}
                      </h4>
                      <span className="text-sm bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">
                        {typeSuggestions.length}
                      </span>
                    </div>

                    {/* Mobile Cards List */}
                    <div className="space-y-2">
                      {typeSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md active:scale-[0.98] text-left ${
                            typeColors[suggestion.type]
                          }`}
                        >
                          {/* Icon */}
                          <div className="flex-shrink-0 p-2 bg-white/70 rounded-lg shadow-sm">
                            <div className="w-5 h-5">{suggestion.icon}</div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h5 className="text-base font-medium leading-tight text-gray-900 mb-1">
                              {suggestion.title}
                            </h5>
                            {suggestion.description && (
                              <p className="text-sm text-gray-600 mb-1">{suggestion.description}</p>
                            )}
                            {suggestion.count && (
                              <span className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full">
                                {suggestion.count}
                              </span>
                            )}
                          </div>

                          {/* Arrow */}
                          <div className="flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="flex-shrink-0 px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-center text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  {Object.keys(groupedSuggestions).length} категорий • {searchSuggestions.length} разделов
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Dropdown */}
      {!isMobile && (
        <div
          className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ease-out transform ${
            isDropdownOpen
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
          }`}
          style={{ zIndex: 9999 }}
        >
          <div className="max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-600" />
                Расширенный поиск
              </h3>
              <p className="text-sm text-gray-600 mt-1">Выберите категорию или популярный запрос</p>
            </div>

            {/* Suggestions by Type */}
            <div className="p-4 space-y-6">
              {Object.entries(groupedSuggestions).map(([type, suggestions]) => (
                <div key={type}>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    {typeIcons[type as keyof typeof typeIcons]}
                    {typeLabels[type as keyof typeof typeLabels]}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 text-left ${
                          typeColors[suggestion.type]
                        }`}
                      >
                        <div className="flex-shrink-0">{suggestion.icon}</div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate block">{suggestion.title}</span>
                          {suggestion.count && (
                            <span className="text-xs text-gray-500 mt-1 block">{suggestion.count}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">Нажмите на любой вариант для быстрого поиска</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
