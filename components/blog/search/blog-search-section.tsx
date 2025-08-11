"use client"

import { BlogSearchBar } from "./blog-search-bar"

interface BlogSearchSectionProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function BlogSearchSection({ searchQuery, onSearch }: BlogSearchSectionProps) {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
      <BlogSearchBar
        searchQuery={searchQuery}
        onSearch={onSearch}
        placeholder="Введите запрос по статьям..."
        className="max-w-2xl mx-auto"
      />
    </section>
  )
}
