"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Search, ArrowRight, X, Menu } from "lucide-react"
import { BlogSearchDropdown } from "./blog-search-dropdown"
import { searchSuggestions, type SearchSuggestion } from "./blog-search-suggestions"

interface BlogSearchComponentProps {
  searchQuery: string
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  size?: "default" | "large"
}

export function BlogSearchComponent({
  searchQuery,
  onSearch,
  placeholder = "Поиск по Таиланду для русских...",
  className = "",
  size = "default",
}: BlogSearchComponentProps) {
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

  // Синхронизация с внешним состоянием
  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

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

  const isLarge = size === "large"
  const iconSize = isLarge ? "w-6 h-6" : "w-5 h-5"
  const containerSize = isLarge ? "w-14 h-14" : "w-12 h-12"
  const inputPadding = isLarge ? "py-4" : "py-3"
  const inputTextSize = isLarge ? "text-lg" : "text-base"

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
          <div className={`flex items-center justify-center ${containerSize} bg-white rounded-full ml-1`}>
            <Search className={`text-gray-400 ${iconSize}`} />
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
            className={`flex-1 px-4 ${inputPadding} ${inputTextSize} bg-transparent focus:outline-none text-gray-900 placeholder-gray-500`}
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
              className={`flex items-center justify-center ${containerSize} text-gray-400 hover:text-gray-600 transition-colors duration-200 mr-1`}
            >
              <Menu className={iconSize} />
            </button>
          )}

          {/* Submit Button - Hidden on mobile when menu button is shown */}
          {!isMobile && (
            <button
              type="submit"
              className={`flex items-center justify-center ${containerSize} text-white font-medium rounded-full mr-1 transition-all duration-500 hover:scale-105 active:scale-95 group relative overflow-hidden`}
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
                className={`${iconSize} transition-all duration-500 relative z-10 ${
                  isHovered ? "-rotate-45 scale-110 -translate-y-1" : "group-hover:-rotate-45 group-hover:scale-110"
                }`}
              />

              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-full bg-white/20 scale-0 transition-transform duration-300 group-active:scale-100" />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      <BlogSearchDropdown
        isOpen={isDropdownOpen}
        suggestions={searchSuggestions}
        onSuggestionClick={handleSuggestionClick}
        isMobile={isMobile}
      />
    </div>
  )
}
