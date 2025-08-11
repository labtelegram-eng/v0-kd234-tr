import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/utils/supabase/server"
import { getCurrentUser } from "@/lib/supabase-helpers"

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()

    const { data: destinations, error } = await supabase
      .from("destinations")
      .select("*")
      .order("order", { ascending: true })

    if (error) {
      console.error("Error fetching destinations:", error)
      return NextResponse.json({ error: "Ошибка загрузки направлений" }, { status: 500 })
    }

    return NextResponse.json({ destinations: destinations || [] })
  } catch (error) {
    console.error("Error in destinations API:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const body = await request.json()
    const { name, image, order, isActive } = body

    if (!name || !image) {
      return NextResponse.json({ error: "Название и изображение обязательны" }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    const { data: destination, error } = await supabase
      .from("destinations")
      .insert({
        name,
        image,
        order: order || 0,
        is_active: isActive !== undefined ? isActive : true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating destination:", error)
      return NextResponse.json({ error: "Ошибка создания направления" }, { status: 500 })
    }

    return NextResponse.json({ destination })
  } catch (error) {
    console.error("Error in destinations POST:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const body = await request.json()
    const { id, name, image, order, isActive } = body

    if (!id) {
      return NextResponse.json({ error: "ID направления обязателен" }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (image !== undefined) updateData.image = image
    if (order !== undefined) updateData.order = order
    if (isActive !== undefined) updateData.is_active = isActive
    updateData.updated_at = new Date().toISOString()

    const { data: destination, error } = await supabase
      .from("destinations")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating destination:", error)
      return NextResponse.json({ error: "Ошибка обновления направления" }, { status: 500 })
    }

    return NextResponse.json({ destination })
  } catch (error) {
    console.error("Error in destinations PUT:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID направления обязателен" }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    const { error } = await supabase.from("destinations").delete().eq("id", Number.parseInt(id))

    if (error) {
      console.error("Error deleting destination:", error)
      return NextResponse.json({ error: "Ошибка удаления направления" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in destinations DELETE:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
