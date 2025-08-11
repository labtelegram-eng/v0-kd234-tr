"use client"

import { Search, Filter, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { NEWS_CATEGORIES } from "./news-constants"
import { useState, useRef, useEffect } from "react"

interface NewsSearchFilterProps {
  searchQuery: string
  selectedCategory: string
  onSearchChange: (query: string) => void
  onCategoryChange: (category: string) => void
}

export function NewsSearchFilter({
  searchQuery,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
}: NewsSearchFilterProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSearchFocus = () => {
    setIsSearchFocused(true)
  }

  const handleSearchBlur = () => {
    setIsSearchFocused(false)
  }

  const handleClearSearch = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSearchChange("")
    searchInputRef.current?.focus()
  }

  // Проверяем, есть ли активные фильтры
  const hasActiveFilters = searchQuery || selectedCategory !== "all"

  return (
    <div className="border-b border-gray-200 shadow-sm bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between py-4 gap-6">
          {/* Left - Search Field */}
          <div className="flex items-center gap-4">
            <div 
              className={`relative transition-all duration-500 ease-out ${
                isSearchFocused ? 'w-[520px]' : 'w-80'
              }`}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Поиск новостей..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className={`w-full pl-12 pr-12 py-3 h-[40px] border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 text-sm ${
                    isSearchFocused ? 'shadow-lg' : 'hover:bg-white'
                  }`}
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right - Categories */}
          <div className="flex items-center gap-2">
            {NEWS_CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onCategoryChange(category.id)}
                className={`text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg transform hover:scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Top row - Search + Filter button */}
          <div className="flex items-center gap-3 py-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Поиск новостей..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className={`px-3 py-2.5 border-2 rounded-lg transition-all duration-300 ${
                isMobileFiltersOpen 
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 text-blue-600 shadow-lg" 
                  : "bg-white border-gray-300 hover:border-gray-400 hover:shadow-md"
              }`}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Expandable Categories */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isMobileFiltersOpen ? "max-h-40 pb-3 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="grid grid-cols-2 gap-2">
              {NEWS_CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    onCategoryChange(category.id)
                    setIsMobileFiltersOpen(false)
                  }}
                  className={`text-xs font-medium py-2 px-3 rounded-full transition-all duration-300 ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 border-blue-600 shadow-md transform hover:scale-105"
                      : "text-gray-600 border-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-gray-400"
                  }`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filters indicator with optimized smooth animation */}
        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
            hasActiveFilters 
              ? "max-h-24 opacity-100" 
              : "max-h-0 opacity-0"
          }`}
        >
          <div className={`border-t border-gray-100 py-3 transition-transform duration-300 ease-in-out ${
            hasActiveFilters ? "translate-y-0" : "-translate-y-2"
          }`}>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Активные фильтры:</span>
              {searchQuery && (
                <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium border border-blue-200 shadow-sm">
                  "{searchQuery}"
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium border border-green-200 shadow-sm">
                  {NEWS_CATEGORIES.find((cat) => cat.id === selectedCategory)?.name}
                </span>
              )}
              <button
                onClick={() => {
                  onSearchChange("")
                  onCategoryChange("all")
                }}
                className="ml-auto text-xs text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200 hover:bg-blue-50 px-2 py-1 rounded-md"
              >
                Сбросить все
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
