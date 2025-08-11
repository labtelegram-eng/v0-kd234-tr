export default function imageLoader({ src, width, quality }) {
  // If it's a Base64 data URL, return as is
  if (src.startsWith("data:")) {
    return src
  }

  // If it's a placeholder SVG, return as is
  if (src.includes("/placeholder.svg")) {
    return src
  }

  // For other images, return the original src
  return src
}
