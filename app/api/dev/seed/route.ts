import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createSupabaseServerClient } from "@/utils/supabase/server"

export async function POST(_req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    // Users
    const { count: usersCount } = await supabase.from("users").select("*", { count: "exact", head: true })
    if (!usersCount || usersCount === 0) {
      const hash = await bcrypt.hash("admin123", 10)
      await supabase.from("users").insert({
        username: "admin",
        password_hash: hash,
        role: "admin",
        security_question: "Как звали вашего первого питомца?",
        security_answer: "админ",
      })
    }

    // Home settings
    await supabase.from("home_settings").upsert(
      {
        id: 1,
        hero_title: "Откройте для себя чудеса Таиланда",
        hero_subtitle:
          "Откройте для себя красоту, культуру и приключения, которые ждут вас в Стране Улыбок. Спланируйте свое идеальное путешествие с нашим подробным гидом.",
        hero_button_text: "Начать планирование",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )

    // Slides
    await supabase.from("hero_slides").delete().neq("id", -1)
    await supabase.from("hero_slides").insert([
      {
        image: "/hero/thailand-rural-countryside.webp",
        alt: "Сельская местность Таиланда",
        order: 1,
        is_active: true,
        settings_id: 1,
      },
      {
        image: "/hero/luxury-resort-courtyard.webp",
        alt: "Роскошный курорт",
        order: 2,
        is_active: true,
        settings_id: 1,
      },
      {
        image: "/hero/tropical-islands-aerial.webp",
        alt: "Тропические острова",
        order: 3,
        is_active: true,
        settings_id: 1,
      },
      {
        image: "/hero/thailand-flag-mountain-view.webp",
        alt: "Флаг Таиланда на вершине",
        order: 4,
        is_active: true,
        settings_id: 1,
      },
    ])

    // Destinations (popular directions)
    await supabase.from("destinations").delete().neq("id", -1)
    await supabase.from("destinations").insert([
      { name: "Пхукет", image: "/destinations/new-phuket.webp", order: 1, is_active: true },
      { name: "Бангкок", image: "/destinations/new-bangkok.webp", order: 2, is_active: true },
      { name: "Чиангмай", image: "/destinations/new-chiang-mai.webp", order: 3, is_active: true },
      { name: "Краби", image: "/destinations/new-krabi.webp", order: 4, is_active: true },
      { name: "Паттайя", image: "/destinations/new-pattaya.webp", order: 5, is_active: true },
      { name: "Ко Самуи", image: "/destinations/new-koh-samui.webp", order: 6, is_active: true },
    ])

    // Culture video
    await supabase.from("culture_video").upsert(
      {
        id: 1,
        title: "Тайская культура и традиции",
        description: "Познакомьтесь с богатой культурой и традициями Таиланда",
        youtube_url: "https://www.youtube.com/watch?v=v86OlB4f2QY",
        thumbnail: "/thai-culture-video.png",
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )

    // Blog categories
    await supabase.from("blog_categories").upsert(
      [
        { id: "culture", name: "Культура", slug: "culture", is_active: true, order: 1 },
        { id: "travel", name: "Путешествия", slug: "travel", is_active: true, order: 2 },
        { id: "food", name: "Еда", slug: "food", is_active: true, order: 3 },
        { id: "tips", name: "Советы", slug: "tips", is_active: true, order: 4 },
        { id: "history", name: "История", slug: "history", is_active: true, order: 5 },
        { id: "nature", name: "Природа", slug: "nature", is_active: true, order: 6 },
      ],
      { onConflict: "id" },
    )

    // Blog posts (if empty)
    const { count: blogCount } = await supabase.from("blog_posts").select("*", { head: true, count: "exact" })
    if (!blogCount || blogCount === 0) {
      await supabase.from("blog_posts").insert([
        {
          title: "Традиции и обычаи тайской культуры",
          excerpt: "Главные аспекты культуры Таиланда.",
          content: "# Традиции и обычаи тайской культуры\n\nКраткий обзор.",
          image: "/blog/thai-culture-buddha.jpg",
          category: "culture",
          slug: "thai-culture-traditions",
          published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          read_time: 8,
          is_active: true,
        },
      ])
    }

    // News widgets (if empty)
    const { count: widgetsCount } = await supabase.from("news_widgets").select("*", { head: true, count: "exact" })
    if (!widgetsCount || widgetsCount === 0) {
      await supabase.from("news_widgets").insert([
        {
          type: "time",
          title: "Время в Бангкоке",
          is_active: true,
          order: 1,
          settings: { timezone: "Asia/Bangkok", format: "24h", icon: "Clock", color: "blue" },
        },
        {
          type: "safety",
          title: "Безопасность",
          is_active: true,
          order: 2,
          settings: {
            status: "safe",
            level: "низкий",
            reason: "Нет значимых ограничений",
            icon: "Shield",
            color: "green",
          },
        },
      ])
    }

    // Music tracks (if empty)
    const { count: musicCount } = await supabase.from("music_tracks").select("*", { head: true, count: "exact" })
    if (!musicCount || musicCount === 0) {
      await supabase.from("music_tracks").insert([
        {
          name: "วันจันทร์",
          artist: "Only Monday (GeneLab)",
          cover_image: "https://img.youtube.com/vi/AG2hEkIcxWE/maxresdefault.jpg",
          youtube_url: "https://youtu.be/AG2hEkIcxWE",
          order: 1,
          is_active: true,
        },
        {
          name: "เริ่มใหม่",
          artist: "Three Man Down",
          cover_image: "https://img.youtube.com/vi/8U4HrSKu9AI/maxresdefault.jpg",
          youtube_url: "https://www.youtube.com/watch?v=8U4HrSKu9AI",
          order: 2,
          is_active: true,
        },
        {
          name: "Тайская народная музыка",
          artist: "Народные исполнители",
          cover_image: "https://img.youtube.com/vi/_U61ymNHBcU/maxresdefault.jpg",
          youtube_url: "https://youtu.be/_U61ymNHBcU",
          order: 3,
          is_active: true,
        },
      ])
    }

    return NextResponse.json({ success: true, note: "Seed completed" })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: "Ошибка инициализации данных" }, { status: 500 })
  }
}
