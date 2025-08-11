import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/utils/supabase/server"
import { createUserSession, sessionCookieName } from "@/lib/supabase-helpers"

export async function POST(request: NextRequest) {
  try {
    const { username, password, securityQuestion, securityAnswer } = await request.json()

    if (!username || !password || !securityQuestion || !securityAnswer) {
      return NextResponse.json({ success: false, error: "Все поля обязательны" }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    // Проверяем, существует ли пользователь
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username.toLowerCase())
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Пользователь с таким логином уже существует" },
        { status: 400 },
      )
    }

    // Создаем нового пользователя
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        username: username.toLowerCase(),
        password_hash: password, // В реальном проекте используйте bcrypt
        security_question: securityQuestion,
        security_answer_hash: securityAnswer.toLowerCase().trim(),
        role: "user",
      })
      .select("id, username, role")
      .single()

    if (createError) {
      console.error("Error creating user:", createError)
      return NextResponse.json({ success: false, error: "Ошибка при создании пользователя" }, { status: 500 })
    }

    // Создаем сессию
    const sessionToken = await createUserSession(newUser.id)

    // Создаем ответ с куки
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
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
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
