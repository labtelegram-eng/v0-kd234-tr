import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/utils/supabase/server"
import { requireAdmin } from "@/lib/supabase-helpers"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const id = Number.parseInt(params.id)
    const body = await request.json()
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from("hero_slides")
      .update({
        image: body.image,
        alt: body.alt,
        order: body.order,
        is_active: body.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single()
    if (error) throw error
    return NextResponse.json({ success: true, slide: { ...data, isActive: data.is_active } })
  } catch (error: any) {
    if (error?.message === "FORBIDDEN") return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    console.error("Update hero slide error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const id = Number.parseInt(params.id)
    const supabase = createSupabaseServerClient()
    const { error } = await supabase.from("hero_slides").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.message === "FORBIDDEN") return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    console.error("Delete hero slide error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
