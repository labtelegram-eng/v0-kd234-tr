"use client"

import { useState } from "react"
import { BlogPostCard } from "./posts/blog-post-card"
import { BlogPostsLoading } from "./posts/blog-posts-loading"
import { BlogPostsEmpty } from "./posts/blog-posts-empty"

interface BlogPost {
  id: number
  title: string
  excerpt: string
  image: string
  category: string
  slug: string
  publishedAt: string
  readTime: number
  isActive: boolean
}

interface BlogTemplateProps {
  posts: BlogPost[]
  isLoading: boolean
  layout?: "grid" | "list" | "masonry"
  showCategories?: boolean
  showPagination?: boolean
}

export function BlogTemplate({
  posts,
  isLoading,
  layout = "grid",
  showCategories = true,
  showPagination = true,
}: BlogTemplateProps) {
  const [selectedCategory, setSelectedCategory] = useState("Все")
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 6

  if (isLoading) {
    return <BlogPostsLoading layout={layout} />
  }

  if (posts.length === 0) {
    return <BlogPostsEmpty />
  }

  // Filter posts by category
  const filteredPosts = selectedCategory === "Все" ? posts : posts.filter((post) => post.category === selectedCategory)

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const currentPosts = filteredPosts.slice(startIndex, endIndex)

  // Reset to page 1 when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getGridClasses = () => {
    switch (layout) {
      case "list":
        return "space-y-8"
      case "masonry":
        return "columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8"
      default:
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    }
  }

  const categories = ["Все", "Культура", "Путешествия", "Еда", "Советы", "История", "Природа"]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Categories Filter */}
      {showCategories && (
        <div className="mb-12">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                  selectedCategory === category
                    ? "bg-emerald-500 text-white shadow-lg"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-500">
              Найдено статей: <span className="font-semibold text-emerald-600">{filteredPosts.length}</span>
            </p>
          </div>
        </div>
      )}

      {/* Posts Grid */}
      <section id="blog-posts" className="py-4">
        <div className={getGridClasses()}>
          {currentPosts.map((post) => (
            <BlogPostCard key={post.id} post={post} layout={layout} />
          ))}
        </div>
      </section>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 py-12 border-t border-gray-100 mt-12">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Предыдущая
          </button>
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  page === currentPage
                    ? "bg-emerald-500 text-white shadow-md"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Следующая
          </button>
        </div>
      )}
    </div>
  )
}
