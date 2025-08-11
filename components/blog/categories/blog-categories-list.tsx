"use client"

import { BlogCategoryCard } from "./blog-category-card"

interface BlogCategory {
  id: string
  name: string
  slug: string
  isActive: boolean
}

interface BlogCategoriesListProps {
  categories: BlogCategory[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function BlogCategoriesList({ categories, selectedCategory, onCategoryChange }: BlogCategoriesListProps) {
  const allCategories = [
    { id: "all", name: "Всё", slug: "all", isActive: true },
    ...categories.filter((cat) => cat.isActive),
  ]

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {allCategories.map((category) => (
        <BlogCategoryCard
          key={category.id}
          category={category}
          isSelected={selectedCategory === category.slug}
          onClick={() => onCategoryChange(category.slug)}
        />
      ))}
    </div>
  )
}
