"use client"

interface BlogCategory {
  id: string
  name: string
  slug: string
  isActive: boolean
}

interface BlogCategoriesSectionProps {
  categories: BlogCategory[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function BlogCategoriesSection({ categories, selectedCategory, onCategoryChange }: BlogCategoriesSectionProps) {
  const allCategories = [
    { id: "all", name: "Всё", slug: "all", isActive: true },
    ...categories.filter((cat) => cat.isActive),
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {allCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.slug)}
            className={`px-3 sm:px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedCategory === category.slug
                ? "bg-blue-600 text-white shadow-md transform scale-105"
                : "bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600 shadow-sm hover:shadow-md border border-gray-200"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </section>
  )
}
