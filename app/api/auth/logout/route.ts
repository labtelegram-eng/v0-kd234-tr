import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/utils/supabase/server"
import { sessionCookieName } from "@/lib/supabase-helpers"

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(sessionCookieName())?.value

    if (sessionToken) {
      const supabase = createSupabaseServerClient()

      // Удаляем сессию из базы данных
      const { error } = await supabase.from("app_sessions").delete().eq("session_token", sessionToken)

      if (error) {
        console.error("Error deleting session:", error)
      }
    }

    // Создаем ответ
    const response = NextResponse.json({ success: true })

    // Удаляем куки
    response.cookies.delete(sessionCookieName())

    return response
  } catch (error) {
    console.error("Logout error:", error)

    // Даже если произошла ошибка, удаляем куки
    const response = NextResponse.json({ success: true })
    response.cookies.delete(sessionCookieName())

    return response
  }
}
