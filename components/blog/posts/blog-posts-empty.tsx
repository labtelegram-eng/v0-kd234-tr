"use client"

import { FileText, Search } from "lucide-react"

export function BlogPostsEmpty() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center py-20">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-8">
          <FileText className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Статьи не найдены</h3>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          К сожалению, по вашему запросу статьи не найдены. Попробуйте изменить фильтры или поискать что-то другое.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105">
            <Search className="w-5 h-5" />
            <span>Поиск статей</span>
          </button>
          <button className="flex items-center space-x-2 border-2 border-gray-300 hover:border-emerald-500 text-gray-700 hover:text-emerald-600 px-6 py-3 rounded-full font-semibold transition-all duration-300">
            <span>Сбросить фильтры</span>
          </button>
        </div>
      </div>
    </div>
  )
}
