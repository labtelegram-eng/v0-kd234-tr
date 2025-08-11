import type { NewsItem, NewsAuthor } from "./news-types"

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const getTimeAgo = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 24) {
    return `${diffInHours} ч. назад`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} дн. назад`
  }
}

export const getDayLabel = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return "Сегодня"
  } else if (diffInDays === 1) {
    return "Вчера"
  } else if (diffInDays === 2) {
    return "Позавчера"
  } else if (diffInDays <= 7) {
    return `${diffInDays} дня назад`
  } else {
    return formatDate(dateString)
  }
}

export const getCategoryInfo = (categoryId: string) => {
  const categories = [
    {
      id: "tourism",
      name: "Туризм",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    },
    {
      id: "culture",
      name: "Культура",
      color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    },
    {
      id: "food",
      name: "Еда",
      color: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
    },
    {
      id: "events",
      name: "События",
      color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    },
    {
      id: "transport",
      name: "Транспорт",
      color: "bg-gradient-to-r from-indigo-500 to-blue-500 text-white",
    },
    {
      id: "weather",
      name: "Погода",
      color: "bg-gradient-to-r from-sky-500 to-blue-500 text-white",
    },
    {
      id: "general",
      name: "Общее",
      color: "bg-gradient-to-r from-gray-500 to-slate-500 text-white",
    },
  ]

  return categories.find((cat) => cat.id === categoryId) || categories[6]
}

export const getTagInfo = (tagId: string) => {
  const tags = [
    {
      id: "hot",
      name: "горячее",
      color: "bg-red-100 text-red-700 border-red-200",
    },
    {
      id: "trending",
      name: "тренд",
      color: "bg-pink-100 text-pink-700 border-pink-200",
    },
    {
      id: "breaking",
      name: "срочно",
      color: "bg-orange-100 text-orange-700 border-orange-200",
    },
    {
      id: "exclusive",
      name: "эксклюзив",
      color: "bg-purple-100 text-purple-700 border-purple-200",
    },
    {
      id: "travel",
      name: "путешествия",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
      id: "local",
      name: "местное",
      color: "bg-green-100 text-green-700 border-green-200",
    },
    {
      id: "international",
      name: "международное",
      color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    },
    {
      id: "business",
      name: "бизнес",
      color: "bg-gray-100 text-gray-700 border-gray-200",
    },
    {
      id: "lifestyle",
      name: "стиль жизни",
      color: "bg-teal-100 text-teal-700 border-teal-200",
    },
    {
      id: "technology",
      name: "технологии",
      color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    },
  ]

  return (
    tags.find((tag) => tag.id === tagId) || {
      id: tagId,
      name: tagId,
      color: "bg-gray-100 text-gray-700 border-gray-200",
    }
  )
}

export const getNewsIcon = (newsItem: NewsItem) => {
  if (newsItem.isFeatured) {
    return {
      icon: "Star",
      bgColor: "from-yellow-100 to-yellow-200",
    }
  }

  const categoryIcons = {
    tourism: {
      icon: "MapPin",
      color: "text-blue-600",
      bgColor: "from-blue-100 to-blue-200",
    },
    culture: {
      icon: "Palette",
      color: "text-purple-600",
      bgColor: "from-purple-100 to-purple-200",
    },
    food: {
      icon: "UtensilsCrossed",
      color: "text-orange-600",
      bgColor: "from-orange-100 to-orange-200",
    },
    events: {
      icon: "Calendar",
      color: "text-green-600",
      bgColor: "from-green-100 to-green-200",
    },
    transport: {
      icon: "Car",
      color: "text-indigo-600",
      bgColor: "from-indigo-100 to-indigo-200",
    },
    weather: {
      icon: "Cloud",
      color: "text-sky-600",
      bgColor: "from-sky-100 to-sky-200",
    },
    general: {
      icon: "Info",
      color: "text-gray-600",
      bgColor: "from-gray-100 to-gray-200",
    },
  }

  const categoryConfig = categoryIcons[newsItem.category as keyof typeof categoryIcons] || categoryIcons.general

  return {
    icon: categoryConfig.icon,
    color: categoryConfig.color,
    bgColor: categoryConfig.bgColor,
  }
}

export const groupNewsByDays = (newsItems: NewsItem[]) => {
  const groups: { [key: string]: NewsItem[] } = {}

  newsItems.forEach((item) => {
    const dayLabel = getDayLabel(item.publishedAt)
    if (!groups[dayLabel]) {
      groups[dayLabel] = []
    }
    groups[dayLabel].push(item)
  })

  return groups
}

// Простая функция для создания детерминированного "случайного" числа на основе строки
const hashCode = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Конвертируем в 32-битное целое число
  }
  return Math.abs(hash)
}

export const getRandomAuthor = (newsId: string): NewsAuthor => {
  const authors: NewsAuthor[] = [
    {
      id: 1,
      name: "Анна Петрова",
      avatar: "/placeholder.svg?height=40&width=40&text=АП",
      role: "Главный редактор",
      bio: "Специалист по туризму в Таиланде",
    },
    {
      id: 2,
      name: "Михаил Сидоров",
      avatar: "/placeholder.svg?height=40&width=40&text=МС",
      role: "Корреспондент",
      bio: "Эксперт по тайской культуре",
    },
    {
      id: 3,
      name: "Елена Козлова",
      avatar: "/placeholder.svg?height=40&width=40&text=ЕК",
      role: "Фотожурналист",
      bio: "Путешественник и фотограф",
    },
    {
      id: 4,
      name: "Дмитрий Волков",
      avatar: "/placeholder.svg?height=40&width=40&text=ДВ",
      role: "Обозреватель",
      bio: "Специалист по транспорту и логистике",
    },
  ]

  const index = hashCode(newsId) % authors.length
  return authors[index]
}

export const getRandomTags = (newsId: string, count = 2): string[] => {
  const tagIds = [
    "hot",
    "trending",
    "breaking",
    "exclusive",
    "travel",
    "local",
    "international",
    "business",
    "lifestyle",
    "technology",
  ]

  const hash = hashCode(newsId)
  const shuffled = [...tagIds].sort((a, b) => {
    const hashA = hashCode(newsId + a)
    const hashB = hashCode(newsId + b)
    return hashA - hashB
  })

  return shuffled.slice(0, count)
}

export const enhanceNewsWithMetadata = (newsItems: NewsItem[]): NewsItem[] => {
  return newsItems.map((item) => {
    const hash = hashCode(item.id.toString())

    return {
      ...item,
      author: item.author || getRandomAuthor(item.id.toString()),
      tags: item.tags || getRandomTags(item.id.toString(), (hash % 3) + 1),
      viewCount: item.viewCount || (hash % 1000) + 50,
      likeCount: item.likeCount || (hash % 100) + 5,
    }
  })
}

export const findRelatedNews = (currentNews: NewsItem, allNews: NewsItem[], limit = 3): NewsItem[] => {
  return allNews
    .filter(
      (item) =>
        item.id !== currentNews.id &&
        (item.category === currentNews.category || item.tags?.some((tag) => currentNews.tags?.includes(tag))),
    )
    .sort((a, b) => {
      // Детерминированная сортировка на основе ID текущей новости
      const hashA = hashCode(currentNews.id.toString() + a.id.toString())
      const hashB = hashCode(currentNews.id.toString() + b.id.toString())
      return hashA - hashB
    })
    .slice(0, limit)
}
