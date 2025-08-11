import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "home"

    // Получаем активные уведомления для конкретной страницы
    const { data, error } = await supabase
      .from("partner_notifications")
      .select("*")
      .eq("is_active", true)
      .or(`target_scope.eq.pages,target_scope.eq.specific`)

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        notification: null,
      })
    }

    // Фильтруем уведомления по странице
    const filteredNotifications = data.filter((notification) => {
      if (notification.target_scope === "pages") {
        return notification.show_on_pages?.[page] === true
      }
      // Для specific scope можно добавить дополнительную логику
      return false
    })

    if (filteredNotifications.length === 0) {
      return NextResponse.json({
        success: true,
        notification: null,
      })
    }

    // Выбираем случайное уведомление
    const randomIndex = Math.floor(Math.random() * filteredNotifications.length)
    const selectedNotification = filteredNotifications[randomIndex]

    return NextResponse.json({
      success: true,
      notification: selectedNotification,
    })
  } catch (error) {
    console.error("Error fetching random partner notification:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка при загрузке уведомления",
      },
      { status: 500 },
    )
  }
}
