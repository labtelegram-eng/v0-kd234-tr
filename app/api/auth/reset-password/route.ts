import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createSupabaseServerClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { username, securityAnswer, newPassword } = await request.json()

    if (!username || !securityAnswer || !newPassword) {
      return NextResponse.json({ error: "Заполните все поля" }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    // Находим пользователя и проверяем ответ на секретный вопрос
    const { data: user, error } = await supabase
      .from("users")
      .select("id, security_answer")
      .ilike("username", username.trim())
      .maybeSingle()

    if (error) {
      console.error("Supabase error (find user for reset):", error)
      return NextResponse.json({ error: "Ошибка при поиске пользователя" }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    // Проверяем ответ на секретный вопрос
    if (user.security_answer.toLowerCase() !== securityAnswer.toLowerCase()) {
      return NextResponse.json({ error: "Неверный ответ на секретный вопрос" }, { status: 400 })
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Обновляем пароль
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: hashedPassword })
      .eq("id", user.id)

    if (updateError) {
      console.error("Supabase error (update password):", updateError)
      return NextResponse.json({ error: "Ошибка при обновлении пароля" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Пароль успешно обновлен",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
