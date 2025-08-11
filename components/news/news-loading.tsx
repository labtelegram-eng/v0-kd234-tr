export function NewsLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main feed skeleton */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="h-8 bg-gray-200 rounded mb-6 w-48 animate-pulse"></div>
          <div className="space-y-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex gap-4 animate-pulse">
                <div className="w-16 text-center">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2 w-24"></div>
                  <div className="h-5 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar skeleton */}
      <div className="space-y-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-4 animate-pulse">
            <div className="h-32 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
