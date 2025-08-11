"use client"

import type React from "react"
import {
  MapPin,
  FileText,
  Users,
  GraduationCap,
  Building2,
  Info,
  FishIcon as Food,
  ShoppingCart,
  Baby,
  Heart,
  Stethoscope,
  Bus,
  Calendar,
  Coffee,
  Leaf,
  Waves,
  Camera,
  Car,
  LocateIcon as Location,
} from "lucide-react"

export interface SearchSuggestion {
  id: string
  title: string
  type: "visa" | "useful" | "interesting" | "city"
  icon: React.ReactNode
  query: string
  description?: string
  count?: string
}

export const searchSuggestions: SearchSuggestion[] = [
  // Визы
  {
    id: "v1",
    title: "Туристическая виза",
    type: "visa",
    icon: <FileText className="w-4 h-4" />,
    query: "туристическая виза",
    description: "Оформление и продление",
    count: "24 статьи",
  },
  {
    id: "v2",
    title: "NON-ED Visa",
    type: "visa",
    icon: <GraduationCap className="w-4 h-4" />,
    query: "NON-ED виза",
    description: "Студенческая виза",
    count: "18 статей",
  },
  {
    id: "v3",
    title: "Иммиграционные офисы",
    type: "visa",
    icon: <Building2 className="w-4 h-4" />,
    query: "иммиграционные офисы",
    description: "Адреса и контакты",
    count: "12 статей",
  },
  {
    id: "v4",
    title: "Компании для бордеррана",
    type: "visa",
    icon: <Users className="w-4 h-4" />,
    query: "бордерран компании",
    description: "Визовые туры",
    count: "8 статей",
  },
  {
    id: "v5",
    title: "Школы для NON-ED Visa",
    type: "visa",
    icon: <GraduationCap className="w-4 h-4" />,
    query: "школы NON-ED",
    description: "Языковые школы",
    count: "15 статей",
  },

  // Полезное
  {
    id: "u1",
    title: "Введение",
    type: "useful",
    icon: <Info className="w-4 h-4" />,
    query: "введение Таиланд",
    description: "Основы для новичков",
    count: "32 статьи",
  },
  {
    id: "u2",
    title: "Питание",
    type: "useful",
    icon: <Food className="w-4 h-4" />,
    query: "питание еда",
    description: "Рестораны и кухня",
    count: "45 статей",
  },
  {
    id: "u3",
    title: "Товары",
    type: "useful",
    icon: <ShoppingCart className="w-4 h-4" />,
    query: "товары покупки",
    description: "Шоппинг и магазины",
    count: "28 статей",
  },
  {
    id: "u4",
    title: "Для детей",
    type: "useful",
    icon: <Baby className="w-4 h-4" />,
    query: "дети семья",
    description: "Семейный отдых",
    count: "19 статей",
  },
  {
    id: "u5",
    title: "Для животных",
    type: "useful",
    icon: <Heart className="w-4 h-4" />,
    query: "животные питомцы",
    description: "Путешествие с питомцами",
    count: "11 статей",
  },
  {
    id: "u6",
    title: "Медицина",
    type: "useful",
    icon: <Stethoscope className="w-4 h-4" />,
    query: "медицина больницы",
    description: "Лечение и страховка",
    count: "22 статьи",
  },
  {
    id: "u7",
    title: "Общественный транспорт",
    type: "useful",
    icon: <Bus className="w-4 h-4" />,
    query: "транспорт автобус",
    description: "Метро, автобусы, такси",
    count: "16 статей",
  },

  // Интересное
  {
    id: "i1",
    title: "Мероприятия",
    type: "interesting",
    icon: <Calendar className="w-4 h-4" />,
    query: "мероприятия события",
    description: "Фестивали и события",
    count: "38 статей",
  },
  {
    id: "i2",
    title: "Заведения",
    type: "interesting",
    icon: <Coffee className="w-4 h-4" />,
    query: "заведения бары",
    description: "Бары, клубы, кафе",
    count: "42 статьи",
  },
  {
    id: "i3",
    title: "4-20",
    type: "interesting",
    icon: <Leaf className="w-4 h-4" />,
    query: "4-20 каннабис",
    description: "Легальный каннабис",
    count: "14 статей",
  },
  {
    id: "i4",
    title: "Пляжи",
    type: "interesting",
    icon: <Waves className="w-4 h-4" />,
    query: "пляжи море",
    description: "Лучшие пляжи",
    count: "35 статей",
  },
  {
    id: "i5",
    title: "Экскурсии",
    type: "interesting",
    icon: <Camera className="w-4 h-4" />,
    query: "экскурсии туры",
    description: "Туры и достопримечательности",
    count: "29 статей",
  },
  {
    id: "i6",
    title: "Туристическая аренда",
    type: "interesting",
    icon: <Car className="w-4 h-4" />,
    query: "аренда мотобайк",
    description: "Байки, машины, лодки",
    count: "17 статей",
  },
  {
    id: "i7",
    title: "Локации для досуга",
    type: "interesting",
    icon: <Location className="w-4 h-4" />,
    query: "досуг развлечения",
    description: "Парки, музеи, активности",
    count: "31 статья",
  },

  // Города
  {
    id: "c1",
    title: "Бангкок",
    type: "city",
    icon: <MapPin className="w-4 h-4" />,
    query: "Бангкок",
    description: "Столица Таиланда",
    count: "156 статей",
  },
  {
    id: "c2",
    title: "Пхукет",
    type: "city",
    icon: <MapPin className="w-4 h-4" />,
    query: "Пхукет",
    description: "Популярный курорт",
    count: "89 статей",
  },
  {
    id: "c3",
    title: "Паттайя",
    type: "city",
    icon: <MapPin className="w-4 h-4" />,
    query: "Паттайя",
    description: "Курортный город",
    count: "67 статей",
  },
  {
    id: "c4",
    title: "Чиангмай",
    type: "city",
    icon: <MapPin className="w-4 h-4" />,
    query: "Чиангмай",
    description: "Северная столица",
    count: "54 статьи",
  },
]

export const typeLabels = {
  visa: "Визы",
  useful: "Полезное",
  interesting: "Интересное",
  city: "Города",
}

export const typeColors = {
  visa: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
  useful: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  interesting: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  city: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
}

export function groupSuggestionsByType(suggestions: SearchSuggestion[]) {
  return suggestions.reduce(
    (acc, suggestion) => {
      if (!acc[suggestion.type]) {
        acc[suggestion.type] = []
      }
      acc[suggestion.type].push(suggestion)
      return acc
    },
    {} as Record<string, SearchSuggestion[]>,
  )
}
