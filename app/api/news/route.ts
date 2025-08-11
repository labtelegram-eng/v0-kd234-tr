import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/utils/supabase/server"
import { requireAdmin } from "@/lib/supabase-helpers"

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase.from("news").select("*").order("published_at", { ascending: false })

    if (error) {
      console.error("News GET error:", error)
      return NextResponse.json({ news: [] })
    }

    return NextResponse.json({ news: data || [] })
  } catch (error) {
    console.error("News GET error:", error)
    return NextResponse.json({ news: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { title, excerpt, content, image, category, isActive, isFeatured } = body

    if (!title || !excerpt || !content) {
      return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from("news")
      .insert({
        title,
        excerpt,
        content,
        image: image || null,
        category: category || "general",
        is_active: isActive !== undefined ? isActive : true,
        is_featured: isFeatured !== undefined ? isFeatured : false,
        published_at: new Date().toISOString(),
      })
      .select("*")
      .single()

    if (error) {
      console.error("News POST error:", error)
      return NextResponse.json({ error: "Ошибка создания новости" }, { status: 500 })
    }

    return NextResponse.json({ news: data })
  } catch (error: any) {
    console.error("News POST error:", error)
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }
    return NextResponse.json({ error: "Ошибка создания новости" }, { status: 500 })
  }
}
