"use client"
import { BlogSearchComponent } from "./blog-search-component"

interface BlogStickySearchProps {
  searchQuery: string
  onSearch: (query: string) => void
  isVisible: boolean
}

export function BlogStickySearch({ searchQuery, onSearch, isVisible }: BlogStickySearchProps) {
  return (
    <div
      className={`fixed top-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <BlogSearchComponent
          searchQuery={searchQuery}
          onSearch={onSearch}
          placeholder="Поиск статей..."
          className="max-w-md mx-auto"
          size="default"
        />
      </div>
    </div>
  )
}
