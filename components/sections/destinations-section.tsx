"use client"

import { useState, useEffect } from "react"
import { OptimizedImage } from "@/components/image-optimizer"

interface Destination {
  id: number
  name: string
  image: string
  order: number
  isActive: boolean
}

export function DestinationsSection() {
  const [destinations, setDestinations] = useState<Destination[]>([])

  useEffect(() => {
    loadDestinations()
  }, [])

  const loadDestinations = async () => {
    try {
      const response = await fetch("/api/destinations?active=true")
      if (response.ok) {
        const data = await response.json()
        setDestinations(data.destinations)
      }
    } catch (error) {
      console.error("Load destinations error:", error)
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Популярные направления</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-3 sm:mb-4">
        {destinations.slice(0, 5).map((destination, index) => (
          <div
            key={destination.id}
            className="group overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 transform bg-white rounded-lg shadow-sm"
          >
            <div className="relative h-24 sm:h-28 md:h-32 w-full overflow-hidden">
              <OptimizedImage
                src={destination.image || "/placeholder.svg"}
                alt={destination.name}
                maxWidth={300}
                maxHeight={200}
                quality={0.95}
                priority={index < 3}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 transition-all duration-500 ease-in-out group-hover:bg-black/5"></div>
            </div>
            <div className="p-2 sm:p-3">
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">{destination.name}</h3>
            </div>
          </div>
        ))}
      </div>

      {destinations.length > 5 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {destinations.slice(5).map((destination) => (
            <div
              key={destination.id}
              className="group overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 transform bg-white rounded-lg shadow-sm"
            >
              <div className="relative h-24 sm:h-28 md:h-32 w-full overflow-hidden">
                <OptimizedImage
                  src={destination.image || "/placeholder.svg"}
                  alt={destination.name}
                  maxWidth={300}
                  maxHeight={200}
                  quality={0.95}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 transition-all duration-500 ease-in-out group-hover:bg-black/5"></div>
              </div>
              <div className="p-2 sm:p-3">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">{destination.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
