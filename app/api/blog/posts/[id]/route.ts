import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServer()
    const { data } = await supabase.from("blog_posts").select("*").eq("id", Number(params.id)).single()
    return NextResponse.json({ post: data ?? null })
  } catch (e) {
    console.error("Post GET error:", e)
    return NextResponse.json({ post: null }, { status: 200 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from("blog_posts")
      .update(body)
      .eq("id", Number(params.id))
      .select("*")
      .single()
    if (error) throw error
    return NextResponse.json({ post: data })
  } catch (e) {
    console.error("Post PUT error:", e)
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServer()
    const { error } = await supabase.from("blog_posts").delete().eq("id", Number(params.id))
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Post DELETE error:", e)
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 })
  }
}
