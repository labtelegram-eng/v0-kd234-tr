"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { BlogHeroSection } from "@/components/blog/blog-hero-section"
import { BlogSearchOverlay } from "@/components/blog/blog-search-overlay"
import { BlogStickySearch } from "@/components/blog/search/blog-sticky-search"
import { BlogCategoriesSection } from "@/components/blog/categories/blog-categories-section"
import { BlogPostsGrid } from "@/components/blog/posts/blog-posts-grid"
import { BlogPagination } from "@/components/blog/pagination/blog-pagination"
import { LoginPanel } from "@/components/auth/login-panel"
import { PartnerNotification } from "@/components/notifications/partner-notification"
import { useNotificationTimer } from "@/hooks/use-notification-timer"

interface SiteUser {
  id: number
  username: string
  role?: string
}

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

interface BlogCategory {
  id: string
  name: string
  slug: string
  isActive: boolean
}

export default function BlogPage() {
  const [user, setUser] = useState<SiteUser | null>(null)
  const [isLoginPanelOpen, setIsLoginPanelOpen] = useState(false)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSticky, setIsSticky] = useState(false)

  // Используем хук для отслеживания времени на странице
  const { shouldShowNotification, closeNotification } = useNotificationTimer('blog')

  const postsPerPage = 4

  useEffect(() => {
    checkAuth()
    loadBlogData()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Auth check error:", error)
    }
  }

  const loadBlogData = async () => {
    try {
      // Загружаем категории
      const categoriesResponse = await fetch("/api/blog/categories")
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories)
      }

      // Загружаем посты
      const postsResponse = await fetch("/api/blog/posts?active=true")
      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        setBlogPosts(postsData.posts)
      }
    } catch (error) {
      console.error("Load blog data error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const toggleLoginPanel = () => {
    setIsLoginPanelOpen(!isLoginPanelOpen)
  }

  const closeLoginPanel = () => {
    setIsLoginPanelOpen(false)
  }

  // Фильтрация постов
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    return matchesSearch && matchesCategory && post.isActive
  })

  // Пагинация
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const currentPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleStickyChange = (sticky: boolean) => {
    setIsSticky(sticky)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader
        user={user}
        onLoginToggle={toggleLoginPanel}
        isLoginPanelOpen={isLoginPanelOpen}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ease-in-out relative ${isLoginPanelOpen ? "md:mr-[400px]" : "md:mr-0"}`}
      >
        {/* Overlay для затемнения контента на десктопе */}
        <div
          className={`
            absolute inset-0 bg-black/20 z-10 transition-opacity duration-300 hidden md:block
            ${isLoginPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
          onClick={closeLoginPanel}
        />

        {/* Контент */}
        <div className="relative z-0">
          {/* Hero Section Container */}
          <div className="relative">
            {/* Background Hero Section */}
            <BlogHeroSection onStickyChange={handleStickyChange} />

            {/* Search Overlay */}
            <BlogSearchOverlay searchQuery={searchQuery} onSearch={handleSearch} />
          </div>

          {/* Sticky Search Bar */}
          <BlogStickySearch searchQuery={searchQuery} onSearch={handleSearch} isVisible={isSticky} />

          {/* Categories Section */}
          <BlogCategoriesSection
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />

          {/* Posts Grid */}
          <BlogPostsGrid posts={currentPosts} isLoading={isLoading} />

          {/* Pagination */}
          {totalPages > 1 && (
            <BlogPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}

          <SiteFooter />
        </div>
      </div>

      {/* Панель авторизации */}
      <LoginPanel isOpen={isLoginPanelOpen} onClose={closeLoginPanel} onUserChange={setUser} />

      {/* Partner Notification */}
      <PartnerNotification 
        page="blog"
        isVisible={shouldShowNotification}
        onClose={closeNotification}
      />
    </div>
  )
}
