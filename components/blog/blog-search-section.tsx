"use client"

import type React from "react"

import { useState } from "react"
import { Search, ArrowRight } from "lucide-react"

interface BlogSearchSectionProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function BlogSearchSection({ searchQuery, onSearch }: BlogSearchSectionProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(localQuery)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value)
    // Поиск в реальном времени с задержкой
    setTimeout(() => {
      onSearch(e.target.value)
    }, 300)
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent">
          {/* Search Icon */}
          <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full ml-2">
            <Search className="text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            placeholder="Введите запрос по статьям..."
            className="flex-1 px-4 py-4 text-lg bg-transparent focus:outline-none text-gray-900 placeholder-gray-500"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-full mr-2 transition-all duration-500 hover:from-violet-500 hover:to-purple-600 hover:shadow-lg hover:shadow-violet-500/25 hover:scale-105 active:scale-95 group relative overflow-hidden"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-full" />

            {/* Icon with position change */}
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 group-hover:-rotate-45 group-hover:scale-110 relative z-10" />

            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full bg-white/20 scale-0 transition-transform duration-300 group-active:scale-100" />
          </button>
        </div>
      </form>
    </section>
  )
}
