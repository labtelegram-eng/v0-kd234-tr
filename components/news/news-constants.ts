import { Plane, Camera, Utensils, Calendar, Car, Newspaper } from "lucide-react"

export const NEWS_CATEGORIES = [
  { id: "tourism", name: "Туризм", color: "bg-blue-100 text-blue-800" },
  { id: "culture", name: "Культура", color: "bg-purple-100 text-purple-800" },
  { id: "food", name: "Еда", color: "bg-green-100 text-green-800" },
  { id: "events", name: "События", color: "bg-orange-100 text-orange-800" },
  { id: "transport", name: "Транспорт", color: "bg-indigo-100 text-indigo-800" },
  { id: "general", name: "Общее", color: "bg-gray-100 text-gray-800" },
]

export const NEWS_CATEGORY_ICONS = {
  tourism: {
    icon: Plane,
    color: "text-blue-600",
    bgColor: "from-blue-100 to-blue-200",
  },
  culture: {
    icon: Camera,
    color: "text-purple-600",
    bgColor: "from-purple-100 to-purple-200",
  },
  food: {
    icon: Utensils,
    color: "text-green-600",
    bgColor: "from-green-100 to-green-200",
  },
  events: {
    icon: Calendar,
    color: "text-orange-600",
    bgColor: "from-orange-100 to-orange-200",
  },
  transport: {
    icon: Car,
    color: "text-indigo-600",
    bgColor: "from-indigo-100 to-indigo-200",
  },
  general: {
    icon: Newspaper,
    color: "text-gray-600",
    bgColor: "from-gray-100 to-gray-200",
  },
}

export const NEWS_TAGS = [
  { id: "breaking", name: "Срочно", color: "bg-red-100 text-red-800" },
  { id: "trending", name: "Популярно", color: "bg-pink-100 text-pink-800" },
  { id: "exclusive", name: "Эксклюзив", color: "bg-yellow-100 text-yellow-800" },
  { id: "interview", name: "Интервью", color: "bg-cyan-100 text-cyan-800" },
  { id: "review", name: "Обзор", color: "bg-teal-100 text-teal-800" },
  { id: "guide", name: "Гид", color: "bg-emerald-100 text-emerald-800" },
  { id: "tips", name: "Советы", color: "bg-lime-100 text-lime-800" },
  { id: "announcement", name: "Анонс", color: "bg-violet-100 text-violet-800" },
]

export const DEFAULT_AUTHORS = [
  {
    id: 1,
    name: "Анна Петрова",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Главный редактор",
    bio: "Эксперт по туризму в Таиланде с 10-летним стажем",
  },
  {
    id: 2,
    name: "Михаил Сидоров",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Тravelwriter",
    bio: "Путешественник и фотограф, специализирующийся на Юго-Восточной Азии",
  },
  {
    id: 3,
    name: "Елена Козлова",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Кулинарный критик",
    bio: "Знаток тайской кухни и традиций",
  },
  {
    id: 4,
    name: "Дмитрий Волков",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Фотокорреспондент",
    bio: "Профессиональный фотограф с опытом работы в Таиланде",
  },
]
