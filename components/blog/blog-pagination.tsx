"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface BlogPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function BlogPagination({ currentPage, totalPages, onPageChange }: BlogPaginationProps) {
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Назад</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => (
            <div key={index}>
              {page === "..." ? (
                <span className="px-2 py-2 text-gray-400 text-sm">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`w-9 h-9 rounded-lg font-medium transition-all duration-300 text-sm ${
                    currentPage === page
                      ? "bg-blue-600 text-white shadow-md transform scale-105"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
          }`}
        >
          <span className="hidden sm:inline">Далее</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Page Info */}
      <div className="text-center mt-3">
        <p className="text-xs sm:text-sm text-gray-500">
          Страница {currentPage} из {totalPages}
        </p>
      </div>
    </section>
  )
}
