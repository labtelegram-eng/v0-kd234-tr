"use client"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"

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
}

// Высококачественный алгоритм ресайза изображений
const resizeImageWithQuality = (
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  quality = 0.95,
): string => {
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  // Устанавливаем размеры canvas
  canvas.width = targetWidth
  canvas.height = targetHeight

  // Включаем сглаживание для лучшего качества
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"

  // Применяем многоступенчатый ресайз для лучшего качества
  const steps = Math.ceil(Math.log2(Math.max(img.width / targetWidth, img.height / targetHeight)))

  if (steps > 1) {
    // Многоступенчатый ресайз
    let currentWidth = img.width
    let currentHeight = img.height
    let currentCanvas = canvas
    let currentCtx = ctx

    for (let i = 0; i < steps; i++) {
      const stepWidth = Math.max(targetWidth, currentWidth / 2)
      const stepHeight = Math.max(targetHeight, currentHeight / 2)

      if (i > 0) {
        currentCanvas = document.createElement("canvas")
        currentCtx = currentCanvas.getContext("2d")!
        currentCtx.imageSmoothingEnabled = true
        currentCtx.imageSmoothingQuality = "high"
      }

      currentCanvas.width = stepWidth
      currentCanvas.height = stepHeight

      if (i === 0) {
        currentCtx.drawImage(img, 0, 0, stepWidth, stepHeight)
      } else {
        const prevCanvas = currentCanvas
        currentCtx.drawImage(prevCanvas, 0, 0, stepWidth, stepHeight)
      }

      currentWidth = stepWidth
      currentHeight = stepHeight

      if (stepWidth === targetWidth && stepHeight === targetHeight) break
    }

    // Финальный шаг на основной canvas
    if (currentCanvas !== canvas) {
      ctx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight)
    }
  } else {
    // Прямой ресайз для небольших изменений
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
  }

  // Возвращаем оптимизированное изображение
  return canvas.toDataURL("image/jpeg", quality)
}

// Вычисление оптимальных размеров с сохранением пропорций
const calculateOptimalSize = (originalWidth: number, originalHeight: number, maxWidth?: number, maxHeight?: number) => {
  if (!maxWidth && !maxHeight) {
    return { width: originalWidth, height: originalHeight }
  }

  const aspectRatio = originalWidth / originalHeight

  let targetWidth = originalWidth
  let targetHeight = originalHeight

  if (maxWidth && targetWidth > maxWidth) {
    targetWidth = maxWidth
    targetHeight = targetWidth / aspectRatio
  }

  if (maxHeight && targetHeight > maxHeight) {
    targetHeight = maxHeight
    targetWidth = targetHeight * aspectRatio
  }

  return {
    width: Math.round(targetWidth),
    height: Math.round(targetHeight),
  }
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  maxWidth,
  maxHeight,
  quality = 0.95,
  className = "",
  priority = false,
  sizes,
  onLoad,
}: OptimizedImageProps) {
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Проверяем, является ли src Base64 строкой
  const isBase64 = src.startsWith("data:")
  const isPlaceholder = src.includes("/placeholder.svg")

  const handleImageLoad = useCallback(
    (img: HTMLImageElement) => {
      if (!canvasRef.current || isBase64 || isPlaceholder) {
        // For Base64 or placeholder images, use them directly
        setOptimizedSrc(src)
        setIsLoading(false)
        onLoad?.()
        return
      }

      const canvas = canvasRef.current
      const { width: optimalWidth, height: optimalHeight } = calculateOptimalSize(
        img.naturalWidth,
        img.naturalHeight,
        maxWidth,
        maxHeight,
      )

      // Если изображение уже оптимального размера, используем оригинал
      if (optimalWidth === img.naturalWidth && optimalHeight === img.naturalHeight) {
        setOptimizedSrc(src)
        setIsLoading(false)
        onLoad?.()
        return
      }

      // Оптимизируем изображение
      try {
        const optimized = resizeImageWithQuality(canvas, img, optimalWidth, optimalHeight, quality)
        setOptimizedSrc(optimized)
      } catch (error) {
        console.error("Error optimizing image:", error)
        setOptimizedSrc(src)
      }
      setIsLoading(false)
      onLoad?.()
    },
    [src, maxWidth, maxHeight, quality, onLoad, isBase64, isPlaceholder],
  )

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
    setOptimizedSrc("/image-error.png")
  }, [])

  // Если это Base64 изображение, используем обычный img тег
  if (isBase64) {
    return (
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onLoad={() => {
          setIsLoading(false)
          onLoad?.()
        }}
        onError={handleError}
        style={{ objectFit: "cover" }}
      />
    )
  }

  return (
    <div className="relative">
      {/* Скрытый canvas для обработки */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Скрытое изображение для загрузки оригинала */}
      {!isBase64 && !isPlaceholder && (
        <img
          src={src || "/placeholder.svg"}
          alt=""
          className="hidden"
          onLoad={(e) => handleImageLoad(e.target as HTMLImageElement)}
          onError={handleError}
          crossOrigin="anonymous"
        />
      )}

      {/* Отображаемое изображение */}
      {(optimizedSrc || isBase64 || isPlaceholder) && !hasError && (
        <Image
          src={optimizedSrc || src || "/placeholder.svg"}
          alt={alt}
          width={width || 600}
          height={height || 400}
          className={className}
          priority={priority}
          sizes={sizes}
          quality={100}
          onError={handleError}
          unoptimized={isBase64 || isPlaceholder}
        />
      )}

      {/* Fallback для ошибок */}
      {hasError && (
        <div className={`${className} bg-gray-200 flex items-center justify-center`}>
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Индикатор загрузки */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}

// Хук для пакетной оптимизации изображений
export function useImageOptimizer() {
  const optimizeImage = useCallback(
    async (file: File, maxWidth?: number, maxHeight?: number, quality = 0.95): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        const canvas = document.createElement("canvas")

        img.onload = () => {
          const { width: optimalWidth, height: optimalHeight } = calculateOptimalSize(
            img.naturalWidth,
            img.naturalHeight,
            maxWidth,
            maxHeight,
          )

          try {
            const optimizedDataUrl = resizeImageWithQuality(canvas, img, optimalWidth, optimalHeight, quality)

            // Конвертируем data URL в Blob
            fetch(optimizedDataUrl)
              .then((res) => res.blob())
              .then(resolve)
              .catch(reject)
          } catch (error) {
            reject(error)
          }
        }

        img.onerror = reject
        img.src = URL.createObjectURL(file)
      })
    },
    [],
  )

  return { optimizeImage }
}
