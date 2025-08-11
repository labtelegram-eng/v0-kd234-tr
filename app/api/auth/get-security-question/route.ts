import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Укажите логин" }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    const { data: user, error } = await supabase
      .from("users")
      .select("security_question")
      .ilike("username", username.trim())
      .maybeSingle()

    if (error) {
      console.error("Supabase error (get security question):", error)
      return NextResponse.json({ error: "Ошибка при поиске пользователя" }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      securityQuestion: user.security_question,
    })
  } catch (error) {
    console.error("Get security question error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
