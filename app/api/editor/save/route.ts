import { NextResponse } from "next/server"

type EditorPayload = {
  type: "blog" | "news"
  title: string
  author?: string
  slug: string
  content: string
  coverImage?: string
  status: "draft" | "published"
}

type StoredPost = EditorPayload & {
  id: string
  createdAt: string
  updatedAt: string
}

const STORE: { posts: StoredPost[] } = { posts: [] }

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<EditorPayload>

  // Basic validation
  if (!body?.title || !body?.slug || !body?.type || !body?.content || !body?.status) {
    return NextResponse.json(
      { ok: false, error: "Не все поля заполнены" },
      { status: 400 }
    )
  }

  const now = new Date().toISOString()
  const existsIndex = STORE.posts.findIndex((p) => p.slug === body.slug)

  const post: StoredPost = {
    id: existsIndex >= 0 ? STORE.posts[existsIndex].id : Math.random().toString(36).slice(2),
    createdAt: existsIndex >= 0 ? STORE.posts[existsIndex].createdAt : now,
    updatedAt: now,
    type: body.type as "blog" | "news",
    title: body.title as string,
    author: body.author || "",
    slug: body.slug as string,
    content: body.content as string,
    coverImage: body.coverImage || "",
    status: body.status as "draft" | "published",
  }

  if (existsIndex >= 0) {
    STORE.posts[existsIndex] = post
  } else {
    STORE.posts.push(post)
  }

  return NextResponse.json({ ok: true, post })
}

export async function GET() {
  return NextResponse.json({ ok: true, posts: STORE.posts })
}
