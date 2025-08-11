"use client"

import { Calendar, Clock, ArrowRight, Eye } from "lucide-react"

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
  layout?: "grid" | "list" | "masonry"
}

export function BlogPostCard({ post, layout = "grid" }: BlogPostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Культура: "bg-purple-500 text-white",
      Путешествия: "bg-blue-500 text-white",
      Еда: "bg-orange-500 text-white",
      Советы: "bg-emerald-500 text-white",
      История: "bg-amber-500 text-white",
      Природа: "bg-green-500 text-white",
    }
    return colors[category as keyof typeof colors] || "bg-gray-500 text-white"
  }

  if (layout === "list") {
    return (
      <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
        <div className="flex flex-col lg:flex-row">
          {/* Image */}
          <div className="relative lg:w-96 h-64 lg:h-auto overflow-hidden">
            <img
              src={post.image || "/placeholder.svg?height=300&width=400&text=Blog+Post"}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=300&width=400&text=" + encodeURIComponent(post.title)
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Category Badge */}
            <div className="absolute top-6 left-6">
              <span className={`px-4 py-2 text-sm font-bold rounded-full shadow-lg ${getCategoryColor(post.category)}`}>
                {post.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 lg:p-10">
            {/* Title */}
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 line-clamp-2 hover:text-emerald-600 transition-colors duration-300">
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className="text-gray-600 text-lg mb-6 line-clamp-3 leading-relaxed">{post.excerpt}</p>

            {/* Meta Information */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-gray-500">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium">{formatDate(post.publishedAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.readTime} мин</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span className="text-sm font-medium">{Math.floor(Math.random() * 1000) + 100}</span>
                </div>
              </div>
              <button className="flex items-center space-x-3 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <span>Читать статью</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-3 group">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={post.image || "/placeholder.svg?height=300&width=400&text=Blog+Post"}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "/placeholder.svg?height=300&width=400&text=" + encodeURIComponent(post.title)
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 text-sm font-bold rounded-full shadow-lg ${getCategoryColor(post.category)}`}>
            {post.category}
          </span>
        </div>

        {/* Read Time Badge */}
        <div className="absolute top-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{post.readTime} мин</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 text-base mb-4 line-clamp-3 leading-relaxed">{post.excerpt}</p>

        {/* Meta Information */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{Math.floor(Math.random() * 500) + 50}</span>
            </div>
          </div>
          <button className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
            <span>Читать</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
