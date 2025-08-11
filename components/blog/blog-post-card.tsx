"use client"

import { useState } from "react"
import Image from "next/image"
import { Clock, Calendar } from "lucide-react"

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

interface BlogPostCardProps {
  post: BlogPost
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const [imageError, setImageError] = useState(false)

  const handleReadMore = () => {
    // В будущем здесь будет переход на страницу статьи
    console.log(`Navigate to /blog/${post.slug}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      culture: "bg-purple-100 text-purple-800",
      travel: "bg-blue-100 text-blue-800",
      food: "bg-orange-100 text-orange-800",
      tips: "bg-green-100 text-green-800",
      default: "bg-gray-100 text-gray-800",
    }
    return colors[category as keyof typeof colors] || colors.default
  }

  const getCategoryName = (category: string) => {
    const names = {
      culture: "Культура",
      travel: "Путешествия",
      food: "Еда",
      tips: "Советы",
    }
    return names[category as keyof typeof names] || category
  }

  return (
    <article className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
      {/* Image - уменьшили высоту */}
      <div className="relative h-40 sm:h-48 md:h-52 w-full overflow-hidden">
        <Image
          src={imageError ? "/placeholder.svg?height=300&width=500&text=Blog+Image" : post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setImageError(true)}
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
            {getCategoryName(post.category)}
          </span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content - уменьшили отступы */}
      <div className="p-4 sm:p-5">
        {/* Meta Info */}
        <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-500 mb-2">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{post.readTime} мин</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2 leading-relaxed">{post.excerpt}</p>

        {/* Read More Button */}
        <button
          onClick={handleReadMore}
          className="inline-flex items-center text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300 group/button"
        >
          Читать статью
          <svg
            className="w-4 h-4 ml-1 transition-transform duration-300 group-hover/button:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </article>
  )
}
