import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`🔄 PUT /api/news-widgets/${params.id} - Updating widget...`)

    const supabase = await createClient()
    const body = await request.json()
    const { id } = params

    const { type, title, isActive, order, settings } = body

    const updateData: any = {}
    if (type !== undefined) updateData.type = type
    if (title !== undefined) updateData.title = title
    if (isActive !== undefined) updateData.is_active = isActive
    if (order !== undefined) updateData.order_index = order
    if (settings !== undefined) updateData.settings = settings
    updateData.updated_at = new Date().toISOString()

    const { data: widget, error } = await supabase
      .from("news_widgets")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("❌ Database error:", error)
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 })
    }

    // Преобразуем данные для фронтенда
    const formattedWidget = {
      id: widget.id,
      type: widget.type,
      title: widget.title,
      isActive: widget.is_active,
      order: widget.order_index,
      settings: widget.settings || {},
      createdAt: widget.created_at,
      updatedAt: widget.updated_at,
    }

    console.log("✅ Widget updated successfully:", formattedWidget.id)
    return NextResponse.json({ widget: formattedWidget })
  } catch (error) {
    console.error(`❌ PUT /api/news-widgets/${params.id} error:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`🔄 DELETE /api/news-widgets/${params.id} - Deleting widget...`)

    const supabase = await createClient()
    const { id } = params

    const { error } = await supabase.from("news_widgets").delete().eq("id", id)

    if (error) {
      console.error("❌ Database error:", error)
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 })
    }

    console.log("✅ Widget deleted successfully:", id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`❌ DELETE /api/news-widgets/${params.id} error:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
