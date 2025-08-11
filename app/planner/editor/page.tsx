"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, MapPin, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

type VisitType = "short" | "weeks" | "months" | "long"
type NeedKey =
  | "housing"
  | "transport"
  | "documents"
  | "food"
  | "entertainment"
  | "nature"
  | "shopping"
  | "wellness"
  | "connectivity"
  | "nearby"
  | "culture"
  | "nightlife"

const VISIT_LABELS: Record<VisitType, string> = {
  short: "Короткая поездка",
  weeks: "На пару недель",
  months: "На несколько месяцев",
  long: "Остаться подольше",
}

const NEED_LABELS: Record<NeedKey, string> = {
  housing: "Жильё",
  transport: "Транспорт",
  documents: "Документы",
  food: "Еда и напитки",
  entertainment: "Развлечения",
  nature: "Природа и активный отдых",
  shopping: "Шопинг",
  wellness: "Здоровье и красота",
  connectivity: "Связь и интернет",
  nearby: "Рядом с вами",
  culture: "Культура",
  nightlife: "Ночная жизнь",
}

export default function PlannerEditor() {
  const searchParams = useSearchParams()
  const [city, setCity] = useState<string>("")
  const [visitType, setVisitType] = useState<VisitType | null>(null)
  const [needs, setNeeds] = useState<NeedKey[]>([])

  useEffect(() => {
    const cityParam = searchParams.get("city")
    const visitParam = searchParams.get("visit") as VisitType
    const needsParam = searchParams.get("needs")

    if (cityParam) setCity(cityParam)
    if (visitParam) setVisitType(visitParam)
    if (needsParam) {
      setNeeds(needsParam.split(",").filter((n) => n in NEED_LABELS) as NeedKey[])
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Link>

              {city && (
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="font-medium">{city}</span>
                </div>
              )}

              {visitType && (
                <div className="flex items-center text-gray-700">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{VISIT_LABELS[visitType]}</span>
                </div>
              )}
            </div>

            <h1 className="text-xl font-semibold text-gray-900">Редактор плана поездки</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Добро пожаловать в планировщик поездки!</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <MapPin className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Город</h3>
              <p className="text-gray-600">{city || "Не выбран"}</p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Тип поездки</h3>
              <p className="text-gray-600">{visitType ? VISIT_LABELS[visitType] : "Не выбран"}</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Потребности</h3>
              <p className="text-gray-600">{needs.length} выбрано</p>
            </div>
          </div>
        </div>

        {needs.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Ваши потребности</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {needs.map((need) => (
                <div key={need} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">{NEED_LABELS[need]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">Планировщик готов к работе</h3>

            <p className="text-gray-600 mb-6">
              Здесь будет интерфейс для создания детального плана поездки на основе ваших предпочтений.
            </p>

            <div className="text-sm text-gray-500">
              Функциональность планировщика будет добавлена в следующих обновлениях
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
