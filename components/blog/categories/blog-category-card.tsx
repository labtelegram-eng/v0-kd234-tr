"use client"

interface BlogCategoryCardProps {
  category: {
    id: string
    name: string
    slug: string
    isActive: boolean
  }
  isSelected: boolean
  onClick: () => void
}

export function BlogCategoryCard({ category, isSelected, onClick }: BlogCategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 sm:px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
        isSelected
          ? "bg-blue-600 text-white shadow-md transform scale-105"
          : "bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600 shadow-sm hover:shadow-md border border-gray-200"
      }`}
    >
      {category.name}
    </button>
  )
}
