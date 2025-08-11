import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from("destinations")
      .update(body)
      .eq("id", Number(params.id))
      .select("*")
      .single()
    if (error) throw error
    return NextResponse.json({ destination: data })
  } catch (e) {
    console.error("Destinations PUT error:", e)
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServer()
    const { error } = await supabase.from("destinations").delete().eq("id", Number(params.id))
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Destinations DELETE error:", e)
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 })
  }
}
