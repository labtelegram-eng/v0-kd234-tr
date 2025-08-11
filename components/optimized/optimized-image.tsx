"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { useLazyImage } from "@/lib/content-optimization"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  maxWidth?: number
  maxHeight?: number
  quality?: number
  className?: string
  priority?: boolean
  sizes?: string
  onLoad?: () => void
  lazy?: boolean
  placeholder?: string
  blurDataURL?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 85,
  className = "",
  priority = false,
  sizes,
  onLoad,
  lazy = true,
  placeholder = "/placeholder.svg",
  blurDataURL,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if it's a Base64 image
  const isBase64 = src.startsWith("data:")
  const isPlaceholder = src.includes("/placeholder.svg")

  // Используем ленивую загрузку если не приоритетное изображение и не Base64
  const lazyImage = useLazyImage(src, {
    placeholder: placeholder,
    rootMargin: "100px",
    threshold: 0.1,
  })

  // Оптимизируем URL изображения
  const optimizedSrc = useCallback(() => {
    if (imageError) return placeholder

    // For Base64 images, return as is
    if (isBase64) return src

    // Если это внешний URL, возвращаем как есть
    if (src.startsWith("http") || src.startsWith("//")) {
      return src
    }

    // Для локальных изображений добавляем параметры оптимизации
    const params = new URLSearchParams()
    if (maxWidth) params.set("w", maxWidth.toString())
    if (maxHeight) params.set("h", maxHeight.toString())
    if (quality) params.set("q", quality.toString())

    const separator = src.includes("?") ? "&" : "?"
    return params.toString() ? `${src}${separator}${params.toString()}` : src
  }, [src, maxWidth, maxHeight, quality, imageError, placeholder, isBase64])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setImageError(true)
    setIsLoading(false)
  }, [])

  // For Base64 images, use regular img tag
  if (isBase64) {
    return (
      <div className="relative">
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          className={`${className} transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
          onLoad={handleLoad}
          onError={handleError}
          style={{ objectFit: "cover" }}
        />

        {/* Индикатор загрузки */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    )
  }

  // Если используется ленивая загрузка и изображение не в зоне видимости
  if (lazy && !priority && !lazyImage.isInView) {
    return (
      <div
        ref={lazyImage.ref}
        className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}
        style={{ width, height }}
      >
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className="relative">
      <Image
        src={optimizedSrc() || "/placeholder.svg"}
        alt={alt}
        width={width || 600}
        height={height || 400}
        className={`${className} transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        unoptimized={isPlaceholder}
      />

      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}
