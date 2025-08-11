import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File
    const maxWidth = Number.parseInt(formData.get("maxWidth") as string) || undefined
    const maxHeight = Number.parseInt(formData.get("maxHeight") as string) || undefined
    const quality = Number.parseInt(formData.get("quality") as string) || 90

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Получаем информацию об изображении
    const metadata = await sharp(buffer).metadata()

    let sharpInstance = sharp(buffer)

    // Применяем ресайз если необходимо
    if (maxWidth || maxHeight) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3, // Высококачественный алгоритм интерполяции
      })
    }

    // Определяем оптимальный формат
    let outputFormat: "jpeg" | "webp" | "png" = "jpeg"

    if (metadata.hasAlpha) {
      outputFormat = "png"
    } else {
      // Проверяем поддержку WebP в заголовках
      const acceptHeader = request.headers.get("accept") || ""
      if (acceptHeader.includes("image/webp")) {
        outputFormat = "webp"
      }
    }

    // Применяем оптимизацию в зависимости от формата
    let optimizedBuffer: Buffer

    switch (outputFormat) {
      case "webp":
        optimizedBuffer = await sharpInstance
          .webp({
            quality,
            effort: 6, // Максимальное качество сжатия
            smartSubsample: true,
          })
          .toBuffer()
        break

      case "png":
        optimizedBuffer = await sharpInstance
          .png({
            quality,
            compressionLevel: 9,
            adaptiveFiltering: true,
          })
          .toBuffer()
        break

      default: // jpeg
        optimizedBuffer = await sharpInstance
          .jpeg({
            quality,
            progressive: true,
            mozjpeg: true, // Используем mozjpeg для лучшего сжатия
          })
          .toBuffer()
    }

    // Получаем информацию об оптимизированном изображении
    const optimizedMetadata = await sharp(optimizedBuffer).metadata()

    return new NextResponse(optimizedBuffer, {
      headers: {
        "Content-Type": `image/${outputFormat}`,
        "Content-Length": optimizedBuffer.length.toString(),
        "X-Original-Size": buffer.length.toString(),
        "X-Optimized-Size": optimizedBuffer.length.toString(),
        "X-Compression-Ratio": ((1 - optimizedBuffer.length / buffer.length) * 100).toFixed(2),
        "X-Original-Dimensions": `${metadata.width}x${metadata.height}`,
        "X-Optimized-Dimensions": `${optimizedMetadata.width}x${optimizedMetadata.height}`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Image optimization error:", error)
    return NextResponse.json({ error: "Failed to optimize image" }, { status: 500 })
  }
}
