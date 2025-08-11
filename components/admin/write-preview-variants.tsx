import { Card, CardContent } from "@/components/ui/card"

export type PreviewData = {
  type: "blog" | "news"
  title: string
  excerpt: string
  coverImage?: string
  authorName?: string
  publishedAt: string
  html: string
  readTimeMin?: number
  categoryName?: string
  views?: number
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return iso
  }
}

const fallbackNews = "/placeholder-q1c8t.png"
const fallbackBlog = "/blog-cover-preview.png"

// News card (like on /news grid)
export function PreviewNewsCard({ data }: { data: PreviewData }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative w-full aspect-[16/9] bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.coverImage || fallbackNews}
          alt="cover"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="rounded bg-gray-100 px-1.5 py-0.5">{data.categoryName || "Новости"}</span>
          <span>{formatDate(data.publishedAt)}</span>
          {data.readTimeMin ? <span>· {data.readTimeMin} мин</span> : null}
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-snug">{data.title}</h3>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{data.excerpt}</p>
      </CardContent>
    </Card>
  )
}

// News detail page hero + content
export function PreviewNewsDetail({ data }: { data: PreviewData }) {
  return (
    <div className="w-full">
      <div className="relative w-full aspect-[21/9] bg-gray-100 rounded-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.coverImage || fallbackNews}
          alt="cover"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="text-xs opacity-90">{data.categoryName || "Новости"}</div>
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold">{data.title}</h1>
          <div className="mt-1 text-xs opacity-90">
            {formatDate(data.publishedAt)}
            {data.readTimeMin ? ` · ${data.readTimeMin} мин чтения` : ""}
            {typeof data.views === "number" ? ` · ${data.views} просмотров` : ""}
          </div>
        </div>
      </div>

      <article className="prose max-w-none mt-6">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: data.html || `<p>${data.excerpt || ""}</p>` }}
        />
      </article>
    </div>
  )
}

// Timeline item preview
export function PreviewTimelineItem({ data }: { data: PreviewData }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-1.5 h-3 w-3 rounded-full bg-cyan-500" />
      <div className="absolute left-4 top-4 bottom-0 w-px bg-gray-200" />
      <div className="text-xs text-gray-500">{formatDate(data.publishedAt)}</div>
      <div className="mt-1 font-semibold">{data.title}</div>
      <div className="text-sm text-gray-600 line-clamp-2">{data.excerpt}</div>
    </div>
  )
}

// Blog card preview
export function PreviewBlogCard({ data }: { data: PreviewData }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative w-full aspect-[16/9] bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.coverImage || fallbackBlog}
          alt="cover"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="text-xs text-gray-600">{data.categoryName || "Блог"}</div>
        <h3 className="mt-1 text-lg font-semibold leading-snug">{data.title}</h3>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{data.excerpt}</p>
      </CardContent>
    </Card>
  )
}
