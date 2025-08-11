import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/utils/supabase/server"
import { requireAdmin } from "@/lib/supabase-helpers"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase.from("news").select("*").eq("id", Number(params.id)).single()

    if (error) {
      console.error("News item GET error:", error)
      return NextResponse.json({ news: null })
    }

    return NextResponse.json({ news: data })
  } catch (error) {
    console.error("News item GET error:", error)
    return NextResponse.json({ news: null })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()

    const body = await request.json()
    const supabase = createSupabaseServerClient()

    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt
    if (body.content !== undefined) updateData.content = body.content
    if (body.image !== undefined) updateData.image = body.image
    if (body.category !== undefined) updateData.category = body.category
    if (body.isActive !== undefined) updateData.is_active = body.isActive
    if (body.isFeatured !== undefined) updateData.is_featured = body.isFeatured

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from("news")
      .update(updateData)
      .eq("id", Number(params.id))
      .select("*")
      .single()

    if (error) {
      console.error("News PUT error:", error)
      return NextResponse.json({ error: "Ошибка обновления новости" }, { status: 500 })
    }

    return NextResponse.json({ news: data })
  } catch (error: any) {
    console.error("News PUT error:", error)
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }
    return NextResponse.json({ error: "Ошибка обновления новости" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()

    const supabase = createSupabaseServerClient()
    const { error } = await supabase.from("news").delete().eq("id", Number(params.id))

    if (error) {
      console.error("News DELETE error:", error)
      return NextResponse.json({ error: "Ошибка удаления новости" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("News DELETE error:", error)
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }
    return NextResponse.json({ error: "Ошибка удаления новости" }, { status: 500 })
  }
}
