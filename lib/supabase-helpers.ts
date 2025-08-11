import { cookies } from "next/headers"
import { createSupabaseServerClient } from "@/utils/supabase/server"

const SESSION_COOKIE = "app_session"

export type AppUser = {
  id: number
  username: string
  role: "user" | "admin"
  created_at?: string
}

export async function getCurrentUser(): Promise<AppUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE)?.value

    if (!sessionToken) {
      console.log("No session token found")
      return null
    }

    const supabase = createSupabaseServerClient()
    const nowIso = new Date().toISOString()

    console.log("Looking for session with token:", sessionToken)

    // Получаем сессию и связанного пользователя
    const { data: sessionData, error: sessionError } = await supabase
      .from("app_sessions")
      .select(`
        id,
        user_id,
        expires_at,
        users!inner (
          id,
          username,
          role,
          created_at
        )
      `)
      .eq("session_token", sessionToken)
      .gt("expires_at", nowIso)
      .maybeSingle()

    if (sessionError) {
      console.error("Session query error:", sessionError)
      return null
    }

    if (!sessionData) {
      console.log("No valid session found")
      return null
    }

    console.log("Session found:", sessionData)

    // Обрабатываем данные пользователя (может быть массивом или объектом)
    const userData = Array.isArray(sessionData.users) ? sessionData.users[0] : sessionData.users

    if (!userData) {
      console.log("No user data in session")
      return null
    }

    return {
      id: userData.id,
      username: userData.username,
      role: (userData.role as "user" | "admin") ?? "user",
      created_at: userData.created_at,
    }
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    return null
  }
}

export async function requireAdmin(): Promise<AppUser> {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") {
    const err: any = new Error("FORBIDDEN")
    err.code = 403
    throw err
  }
  return user
}

export function sessionCookieName() {
  return SESSION_COOKIE
}

// Функция для создания сессии
export async function createUserSession(userId: number): Promise<string> {
  const supabase = createSupabaseServerClient()

  // Генерируем уникальный токен сессии
  const sessionToken = generateSessionToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 дней

  const { data, error } = await supabase
    .from("app_sessions")
    .insert({
      session_token: sessionToken,
      user_id: userId,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating session:", error)
    throw error
  }

  return sessionToken
}

// Функция для удаления сессии
export async function deleteUserSession(sessionToken: string): Promise<void> {
  const supabase = createSupabaseServerClient()

  const { error } = await supabase.from("app_sessions").delete().eq("session_token", sessionToken)

  if (error) {
    console.error("Error deleting session:", error)
    throw error
  }
}

// Генерация токена сессии
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2)
}
