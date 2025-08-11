// Утилиты для работы с изображениями

export interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: "jpeg" | "webp" | "png"
}

// Определение оптимального формата изображения
export function getOptimalImageFormat(originalFormat: string): "jpeg" | "webp" | "png" {
  // Проверяем поддержку WebP
  const supportsWebP = (() => {
    try {
      const canvas = document.createElement("canvas")
      canvas.width = 1
      canvas.height = 1
      return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0
    } catch {
      return false
    }
  })()

  if (supportsWebP && originalFormat !== "png") {
    return "webp"
  }

  if (originalFormat === "png") {
    return "png"
  }

  return "jpeg"
}

// Вычисление размера файла изображения
export function estimateImageSize(width: number, height: number, format: string, quality: number): number {
  const pixels = width * height

  switch (format) {
    case "jpeg":
      return Math.round(pixels * 3 * quality * 0.1) // Примерная оценка для JPEG
    case "webp":
      return Math.round(pixels * 2 * quality * 0.08) // WebP обычно на 25-30% меньше
    case "png":
      return Math.round(pixels * 4) // PNG без сжатия
    default:
      return Math.round(pixels * 3 * quality * 0.1)
  }
}

// Проверка необходимости оптимизации
export function shouldOptimizeImage(
  originalWidth: number,
  originalHeight: number,
  maxWidth?: number,
  maxHeight?: number,
  currentFileSize?: number,
  maxFileSize?: number,
): boolean {
  const sizeNeedsOptimization = (maxWidth && originalWidth > maxWidth) || (maxHeight && originalHeight > maxHeight)

  const fileSizeNeedsOptimization = currentFileSize && maxFileSize && currentFileSize > maxFileSize

  return !!(sizeNeedsOptimization || fileSizeNeedsOptimization)
}

// Прогрессивная загрузка изображений
export class ProgressiveImageLoader {
  private static instance: ProgressiveImageLoader
  private loadingImages = new Map<string, Promise<HTMLImageElement>>()

  static getInstance(): ProgressiveImageLoader {
    if (!ProgressiveImageLoader.instance) {
      ProgressiveImageLoader.instance = new ProgressiveImageLoader()
    }
    return ProgressiveImageLoader.instance
  }

  async loadImage(src: string): Promise<HTMLImageElement> {
    if (this.loadingImages.has(src)) {
      return this.loadingImages.get(src)!
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })

    this.loadingImages.set(src, promise)

    try {
      const img = await promise
      return img
    } finally {
      this.loadingImages.delete(src)
    }
  }
}
