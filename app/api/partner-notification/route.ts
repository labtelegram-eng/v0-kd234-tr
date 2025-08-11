import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/utils/supabase/server"
import { requireAdmin } from "@/lib/supabase-helpers"

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from("partner_notifications")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Partner notifications GET error:", error)
      return NextResponse.json({ notifications: [] })
    }

    return NextResponse.json({
      success: true,
      notifications: data || [],
      notification: data?.find((n) => n.is_active) || null,
    })
  } catch (error) {
    console.error("Partner notifications GET error:", error)
    return NextResponse.json({ notifications: [] })
  }
}

export async function POST(request: NextRequest) {
  console.log("🚀 POST /api/partner-notification - Starting request")

  try {
    // Проверяем авторизацию
    console.log("🔐 Checking admin authorization...")
    await requireAdmin()
    console.log("✅ Admin authorization passed")

    // Парсим тело запроса
    console.log("📝 Parsing request body...")
    const body = await request.json()
    console.log("📋 Request body:", JSON.stringify(body, null, 2))

    const {
      title,
      content,
      cta_text,
      cta_url,
      show_after_seconds = 30,
      show_on_pages = { home: true, blog: true, news: true, destinations: true },
      limit_shows = false,
      max_shows_per_session = 1,
      show_randomly = false,
      target_scope = "pages",
      targeted_news_ids = [],
      targeted_blog_ids = [],
    } = body

    // Валидация обязательных полей
    console.log("✅ Validating required fields...")
    if (!title || !content || !cta_text || !cta_url) {
      console.log("❌ Validation failed - missing required fields")
      return NextResponse.json(
        {
          success: false,
          error: "Заголовок, содержание, текст кнопки и ссылка обязательны",
        },
        { status: 400 },
      )
    }
    console.log("✅ Validation passed")

    // Создаем клиент Supabase
    console.log("🗄️ Creating Supabase client...")
    const supabase = createSupabaseServerClient()
    console.log("✅ Supabase client created")

    // Подготавливаем данные для вставки
    const insertData = {
      title,
      content,
      cta_text,
      cta_url,
      show_after_seconds,
      show_on_pages,
      limit_shows,
      max_shows_per_session,
      show_randomly,
      target_scope,
      targeted_news_ids,
      targeted_blog_ids,
      is_active: true,
    }

    console.log("📊 Insert data:", JSON.stringify(insertData, null, 2))

    // Вставляем данные в базу
    console.log("💾 Inserting data into database...")
    const { data, error } = await supabase.from("partner_notifications").insert(insertData).select("*").single()

    if (error) {
      console.error("❌ Database insert error:", error)
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return NextResponse.json(
        {
          success: false,
          error: `Ошибка базы данных: ${error.message}`,
        },
        { status: 500 },
      )
    }

    console.log("✅ Data inserted successfully:", data)

    return NextResponse.json({
      success: true,
      notification: data,
    })
  } catch (error: any) {
    console.error("❌ Partner notification POST error:", error)
    console.error("Error stack:", error.stack)

    if (error?.message === "FORBIDDEN") {
      console.log("🚫 Access forbidden")
      return NextResponse.json(
        {
          success: false,
          error: "Доступ запрещен",
        },
        { status: 403 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: `Внутренняя ошибка сервера: ${error.message}`,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID уведомления обязателен",
        },
        { status: 400 },
      )
    }

    const supabase = createSupabaseServerClient()

    // Преобразуем поля для соответствия схеме БД
    const dbUpdateData: any = {}
    if (updateData.title !== undefined) dbUpdateData.title = updateData.title
    if (updateData.content !== undefined) dbUpdateData.content = updateData.content
    if (updateData.cta_text !== undefined) dbUpdateData.cta_text = updateData.cta_text
    if (updateData.cta_url !== undefined) dbUpdateData.cta_url = updateData.cta_url
    if (updateData.is_active !== undefined) dbUpdateData.is_active = updateData.is_active
    if (updateData.show_after_seconds !== undefined) dbUpdateData.show_after_seconds = updateData.show_after_seconds
    if (updateData.show_on_pages !== undefined) dbUpdateData.show_on_pages = updateData.show_on_pages
    if (updateData.limit_shows !== undefined) dbUpdateData.limit_shows = updateData.limit_shows
    if (updateData.max_shows_per_session !== undefined)
      dbUpdateData.max_shows_per_session = updateData.max_shows_per_session
    if (updateData.show_randomly !== undefined) dbUpdateData.show_randomly = updateData.show_randomly
    if (updateData.target_scope !== undefined) dbUpdateData.target_scope = updateData.target_scope
    if (updateData.targeted_news_ids !== undefined) dbUpdateData.targeted_news_ids = updateData.targeted_news_ids
    if (updateData.targeted_blog_ids !== undefined) dbUpdateData.targeted_blog_ids = updateData.targeted_blog_ids

    dbUpdateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from("partner_notifications")
      .update(dbUpdateData)
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      console.error("Partner notification PUT error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Ошибка обновления уведомления",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      notification: data,
    })
  } catch (error: any) {
    console.error("Partner notification PUT error:", error)
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          success: false,
          error: "Доступ запрещен",
        },
        { status: 403 },
      )
    }
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка обновления уведомления",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID уведомления обязателен",
        },
        { status: 400 },
      )
    }

    const supabase = createSupabaseServerClient()
    const { error } = await supabase.from("partner_notifications").delete().eq("id", Number(id))

    if (error) {
      console.error("Partner notification DELETE error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Ошибка удаления уведомления",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Уведомление успешно удалено",
    })
  } catch (error: any) {
    console.error("Partner notification DELETE error:", error)
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          success: false,
          error: "Доступ запрещен",
        },
        { status: 403 },
      )
    }
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка удаления уведомления",
      },
      { status: 500 },
    )
  }
}
