"use client"

import { BlogPostCard } from "./blog-post-card"

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

interface BlogPostsGridProps {
  posts: BlogPost[]
  isLoading: boolean
}

export function BlogPostsGrid({ posts, isLoading }: BlogPostsGridProps) {
  if (isLoading) {
    return (
      <section id="blog-posts" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 rounded-xl h-48 sm:h-56 mb-3"></div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (posts.length === 0) {
    return (
      <section id="blog-posts" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="bg-gray-50 rounded-xl p-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Статьи не найдены</h3>
            <p className="text-gray-600">Попробуйте изменить поисковый запрос или выбрать другую категорию</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="blog-posts" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}
