import Image from "next/image"

type SmartImageBase = {
  src: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: "blur" | "empty"
  blurDataURL?: string
}

type SmartImageProps =
  | (SmartImageBase & {
      // For standard images
      width: number
      height: number
      fill?: false
      aspectRatio?: never
    })
  | (SmartImageBase & {
      // For responsive cover images
      fill: true
      width?: never
      height?: never
      aspectRatio?: string // e.g. "16/9" or "4/3" to reserve space and prevent CLS
    })

// Lightweight shimmer for blur placeholder (works for dynamic/remote images)
function shimmer(w: number, h: number) {
  return `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <defs>
      <linearGradient id="g">
        <stop stopColor="#f2f2f2" offset="0%" />
        <stop stopColor="#e6e6e6" offset="20%" />
        <stop stopColor="#f2f2f2" offset="40%" />
        <stop stopColor="#f2f2f2" offset="100%" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="#f3f3f3" />
    <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
    <animate xlinkHref="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite" />
  </svg>`
}

function toBase64(svg: string) {
  if (typeof window === "undefined") {
    // @ts-ignore Node Buffer exists in Next.js server environment
    return Buffer.from(svg).toString("base64")
  } else {
    return window.btoa(svg)
  }
}

export function SmartImage(props: SmartImageProps) {
  const { src, alt, className, priority = false, sizes, quality = 75, placeholder = "blur", blurDataURL } = props

  // Check if it's a Base64 image
  const isBase64 = src.startsWith("data:")
  const isPlaceholder = src.includes("/placeholder.svg")

  const common = {
    alt,
    className,
    priority,
    sizes,
    quality,
    placeholder: placeholder === "blur" && !isBase64 ? "blur" : "empty",
    blurDataURL:
      placeholder === "blur" && !isBase64
        ? blurDataURL ||
          `data:image/svg+xml;base64,${toBase64(
            shimmer(16, 9), // tiny shimmer, browser will scale it
          )}`
        : undefined,
  } as const

  // For Base64 images, use regular img tag
  if (isBase64) {
    if ("fill" in props && props.fill) {
      const aspectStyle = props.aspectRatio ? { aspectRatio: props.aspectRatio as string } : {}
      return (
        <div className={`relative ${className || ""}`} style={aspectStyle}>
          <img
            src={src || "/placeholder.svg"}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectFit: "cover" }}
          />
        </div>
      )
    }

    const { width, height } = props
    return (
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{ objectFit: "cover", height: "auto" }}
      />
    )
  }

  if ("fill" in props && props.fill) {
    const aspectStyle = props.aspectRatio ? { aspectRatio: props.aspectRatio as string } : {}
    return (
      <div className={`relative ${className || ""}`} style={aspectStyle}>
        <Image
          src={src || "/placeholder.svg?height=9&width=16&query=cover%20image"}
          fill
          sizes={sizes || "(max-width: 1024px) 100vw, 1024px"}
          quality={quality}
          alt={alt}
          placeholder={common.placeholder}
          blurDataURL={common.blurDataURL}
          style={{ objectFit: "cover" }}
          priority={priority}
          unoptimized={isPlaceholder}
        />
      </div>
    )
  }

  // width/height branch
  const { width, height } = props
  return (
    <Image
      src={src || "/placeholder.svg?height=9&width=16&query=inline%20image"}
      alt={alt}
      width={width}
      height={height}
      quality={quality}
      priority={priority}
      sizes={sizes}
      placeholder={common.placeholder}
      blurDataURL={common.blurDataURL}
      style={{ objectFit: "cover", height: "auto" }}
      loading={priority ? "eager" : "lazy"}
      unoptimized={isPlaceholder}
    />
  )
}
