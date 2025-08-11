"use client"

import { BlogTemplate } from "../blog-template"

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
  layout?: "grid" | "list" | "masonry"
}

export function BlogPostsGrid({ posts, isLoading, layout = "grid" }: BlogPostsGridProps) {
  return (
    <BlogTemplate posts={posts} isLoading={isLoading} layout={layout} showCategories={true} showPagination={true} />
  )
}
