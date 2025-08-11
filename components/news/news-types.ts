export interface NewsItem {
  id: number
  title: string
  excerpt: string
  content: string
  image: string
  publishedAt: string
  isActive: boolean
  isFeatured: boolean
  category: string
  createdAt: string
  updatedAt: string
  author?: NewsAuthor
  tags?: string[]
  relatedNews?: number[]
  viewCount?: number
  likeCount?: number
}

export interface NewsAuthor {
  id: number
  name: string
  avatar?: string
  role?: string
  bio?: string
}

export interface User {
  id: number
  username: string
  role?: string
}

export interface NewsCategory {
  id: string
  name: string
  color: string
}

export interface NewsIconConfig {
  icon: any
  color: string
  bgColor: string
}

export interface NewsPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  newsItem: NewsItem | null
  relatedNews: NewsItem[]
}
