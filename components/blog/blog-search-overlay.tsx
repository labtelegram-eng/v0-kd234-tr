"use client"

import { BlogSearchComponent } from "./search/blog-search-component"

interface BlogSearchOverlayProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function BlogSearchOverlay({ searchQuery, onSearch }: BlogSearchOverlayProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
      <div className="text-center text-white px-4 max-w-4xl mx-auto w-full pointer-events-auto">
        {/* Spacer to push search below text */}
        <div className="h-32 sm:h-40 md:h-48 lg:h-56" />

        {/* Search Component */}
        <BlogSearchComponent
          searchQuery={searchQuery}
          onSearch={onSearch}
          placeholder="Введите запрос по статьям..."
          className="max-w-2xl mx-auto"
          size="large"
        />
      </div>
    </div>
  )
}
