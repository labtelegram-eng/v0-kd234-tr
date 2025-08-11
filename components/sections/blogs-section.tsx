"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"

export function BlogsSection() {
  const blogs = [
    {
      title: "Гид для новичков",
      subtitle: "Советы для первого посещения",
      icon: <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />,
    },
    {
      title: "Лучшие пляжи Таиланда",
      subtitle: "Топ пляжей в Таиланде",
      icon: <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />,
    },
    {
      title: "Кулинарные изыски Таиланда",
      subtitle: "Изучаем тайскую кухню",
      icon: <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />,
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Туристические блоги</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {blogs.map((blog) => (
          <Card key={blog.title} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0">{blog.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{blog.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{blog.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
