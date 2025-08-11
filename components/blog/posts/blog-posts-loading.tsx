"use client"

interface BlogPostsLoadingProps {
  layout?: "grid" | "list" | "masonry"
}

export function BlogPostsLoading({ layout = "grid" }: BlogPostsLoadingProps) {
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

  const SkeletonCard = ({ isListLayout = false }: { isListLayout?: boolean }) => (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
      {isListLayout ? (
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-96 h-64 lg:h-auto bg-gray-200" />
          <div className="flex-1 p-8 lg:p-10">
            <div className="h-8 bg-gray-200 rounded-lg mb-4" />
            <div className="space-y-3 mb-6">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex space-x-6">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-12" />
              </div>
              <div className="h-10 bg-gray-200 rounded-full w-32" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="h-64 bg-gray-200" />
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded-lg mb-3" />
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-12" />
              </div>
              <div className="h-8 bg-gray-200 rounded-full w-20" />
            </div>
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="text-center py-12 border-b border-gray-100 mb-12 animate-pulse">
        <div className="h-12 bg-gray-200 rounded-lg mx-auto mb-6 w-96" />
        <div className="h-6 bg-gray-200 rounded mx-auto w-2/3" />
      </div>

      {/* Categories Skeleton */}
      <div className="mb-12 animate-pulse">
        <div className="flex flex-wrap gap-4 justify-center">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-full w-24" />
          ))}
        </div>
      </div>

      {/* Posts Skeleton */}
      <section className="py-4">
        <div className={getGridClasses()}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} isListLayout={layout === "list"} />
          ))}
        </div>
      </section>
    </div>
  )
}
