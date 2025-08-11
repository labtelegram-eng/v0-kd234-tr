import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const includeInactive = searchParams.get("includeInactive") === "true"
    const active = searchParams.get("active") === "true"

    const supabase = getSupabaseServer()
    let query = supabase.from("blog_posts").select("*", { count: "exact" }).order("published_at", { ascending: false })

    if (!includeInactive && active) {
      query = query.eq("is_active", true)
    }
    if (category && category !== "all") {
      query = query.eq("category", category)
    }
    if (search) {
      const ilike = `%${search}%`
      query = query.or(`title.ilike.${ilike},excerpt.ilike.${ilike},content.ilike.${ilike}`)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data: posts, error, count } = await query.range(from, to)
    if (error) throw error

    // categories
    const { data: categories } = await supabase
      .from("blog_categories")
      .select("id, name, slug, is_active, order")
      .eq("is_active", true)
      .order("order", { ascending: true })

    return NextResponse.json({
      success: true,
      posts: posts ?? [],
      categories: categories ?? [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
        hasNext: to + 1 < (count ?? 0),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json({ success: false, error: "Ошибка при получении статей" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, excerpt, content, image, category, slug, publishedAt, readTime, isActive } = body
    if (!title || !excerpt || !content || !category) {
      return NextResponse.json({ success: false, error: "Заполните все обязательные поля" }, { status: 400 })
    }

    const finalSlug =
      slug ||
      String(title)
        .toLowerCase()
        .replace(/[^a-zа-я0-9\s]/gi, "")
        .replace(/\s+/g, "-")
        .trim()

    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        title,
        excerpt,
        content,
        image: image || "/blog-post-concept.png",
        category,
        slug: finalSlug,
        published_at: publishedAt || new Date().toISOString(),
        read_time: readTime || 5,
        is_active: isActive ?? true,
      })
      .select("*")
      .single()
    if (error) throw error

    return NextResponse.json({ success: true, post: data })
  } catch (error) {
    console.error("Error creating blog post:", error)
    return NextResponse.json({ success: false, error: "Ошибка при создании статьи" }, { status: 500 })
  }
}
