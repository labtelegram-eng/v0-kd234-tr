import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/utils/supabase/server"

const BUCKET = "uploads"

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const file = form.get("file") as File | null
    if (!file) return NextResponse.json({ error: "Файл не найден" }, { status: 400 })

    const supabase = createSupabaseServerClient()

    // Ensure bucket exists (public)
    try {
      // Will throw if exists; ignore
      await supabase.storage.createBucket(BUCKET, { public: true })
    } catch {}

    const ext = file.name.split(".").pop() || "bin"
    const path = `images/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "application/octet-stream",
    })
    if (upErr) throw upErr

    const { data: pub } = await supabase.storage.from(BUCKET).getPublicUrl(path)
    const imagePath = pub?.publicUrl || `/${BUCKET}/${path}`

    return NextResponse.json({ success: true, imagePath })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Ошибка загрузки файла" }, { status: 500 })
  }
}
