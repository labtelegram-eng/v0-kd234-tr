import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    console.log("🔄 GET /api/news-widgets - Fetching widgets...")

    const supabase = await createClient()

    const { data: widgets, error } = await supabase
      .from("news_widgets")
      .select("*")
      .order("order_index", { ascending: true })

    if (error) {
      console.error("❌ Database error:", error)
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 })
    }

    // Преобразуем данные из базы в формат, ожидаемый фронтендом
    const formattedWidgets =
      widgets?.map((widget) => ({
        id: widget.id,
        type: widget.type,
        title: widget.title,
        isActive: widget.is_active,
        order: widget.order_index,
        settings: widget.settings || {},
        createdAt: widget.created_at,
        updatedAt: widget.updated_at,
      })) || []

    console.log("✅ Widgets fetched successfully:", formattedWidgets.length)
    return NextResponse.json({ widgets: formattedWidgets })
  } catch (error) {
    console.error("❌ GET /api/news-widgets error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 POST /api/news-widgets - Creating widget...")

    const supabase = await createClient()
    const body = await request.json()

    const { type, title, isActive = true, order = 0, settings = {} } = body

    if (!type || !title) {
      return NextResponse.json({ error: "Type and title are required" }, { status: 400 })
    }

    const { data: widget, error } = await supabase
      .from("news_widgets")
      .insert({
        type,
        title,
        is_active: isActive,
        order_index: order,
        settings,
      })
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

    console.log("✅ Widget created successfully:", formattedWidget.id)
    return NextResponse.json({ widget: formattedWidget })
  } catch (error) {
    console.error("❌ POST /api/news-widgets error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
