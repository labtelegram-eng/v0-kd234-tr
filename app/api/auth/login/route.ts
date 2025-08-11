import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/utils/supabase/server"
import { sessionCookieName } from "@/lib/supabase-helpers"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Логин и пароль обязательны" }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    // Ищем пользователя по логину
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, username, password_hash, role")
      .eq("username", username.toLowerCase())
      .maybeSingle()

    if (userError) {
      console.error("Database error:", userError)
      return NextResponse.json({ success: false, error: "Ошибка базы данных" }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "Неверный логин или пароль" }, { status: 401 })
    }

    // Простая проверка пароля (в реальном проекте используйте bcrypt)
    if (user.password_hash !== password) {
      return NextResponse.json({ success: false, error: "Неверный логин или пароль" }, { status: 401 })
    }

    // Создаем сессию вручную
    const sessionToken =
      Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 дней

    const { error: sessionError } = await supabase.from("app_sessions").insert({
      session_token: sessionToken,
      user_id: user.id,
      expires_at: expiresAt.toISOString(),
    })

    if (sessionError) {
      console.error("Session creation error:", sessionError)
      return NextResponse.json({ success: false, error: "Ошибка создания сессии" }, { status: 500 })
    }

    // Создаем ответ с куки
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    })

    // Устанавливаем куки сессии
    response.cookies.set(sessionCookieName(), sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 дней
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
