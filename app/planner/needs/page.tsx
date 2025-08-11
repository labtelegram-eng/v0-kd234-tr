"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Home,
  Car,
  Stamp,
  UtensilsCrossed,
  PartyPopper,
  Trees,
  ShoppingBag,
  HeartPulse,
  Wifi,
  MapPin,
  Building2,
  Wine,
} from "lucide-react"

type VisitType = "short" | "weeks" | "months" | "long" | null
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

const ALL_NEEDS: Array<{
  key: NeedKey
  title: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: "housing", title: "Жильё", desc: "Отели, хостелы, апартаменты, гестхаусы.", icon: Home },
  { key: "transport", title: "Транспорт", desc: "Авиабилеты, аренда байка/авто, такси, трансферы.", icon: Car },
  { key: "documents", title: "Визы и документы", desc: "Визы, страховка, международные права.", icon: Stamp },
  { key: "food", title: "Еда и напитки", desc: "Рестораны, кафе, стритфуд, бары.", icon: UtensilsCrossed },
  {
    key: "entertainment",
    title: "Развлечения",
    desc: "Экскурсии, туры, мероприятия, концерты, шоу.",
    icon: PartyPopper,
  },
  { key: "nature", title: "Природа и активный отдых", desc: "Пляжи, горы, треккинг, дайвинг, серфинг.", icon: Trees },
  { key: "shopping", title: "Шопинг", desc: "Рынки, торговые центры, сувениры.", icon: ShoppingBag },
  { key: "wellness", title: "Здоровье и красота", desc: "Массаж, спа, салоны красоты, аптеки.", icon: HeartPulse },
  { key: "connectivity", title: "Связь и интернет", desc: "SIM/eSIM, Wi‑Fi точки, коворкинги.", icon: Wifi },
  { key: "nearby", title: "Полезное рядом", desc: "Банки, обменники, заправки, прачечные.", icon: MapPin },
  {
    key: "culture",
    title: "Культура и достопримечательности",
    desc: "Храмы, музеи, исторические места.",
    icon: Building2,
  },
  { key: "nightlife", title: "Ночная жизнь", desc: "Клубы, бары, вечерние шоу.", icon: Wine },
]

export default function NeedsPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const city = sp.get("city") || ""
  const visitParam = sp.get("visit") as VisitType
  const visit: VisitType =
    visitParam === "short" || visitParam === "weeks" || visitParam === "months" || visitParam === "long"
      ? visitParam
      : null

  const [selected, setSelected] = useState<Set<NeedKey>>(new Set())

  const toggle = (key: NeedKey) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleContinue = () => {
    const params = new URLSearchParams()
    if (city) params.set("city", city)
    if (visit) params.set("visit", visit)
    params.set("needs", Array.from(selected).join(","))
    router.push(`/planner/editor?${params.toString()}`)
  }

  const visitText = useMemo(() => visitLabel(visit), [visit])

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-8" aria-labelledby="needs-title">
      <style jsx>{`
        @keyframes fadeSlideIn {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.985);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .page-in {
          animation: fadeSlideIn 320ms cubic-bezier(0.16, 1, 0.3, 1) both;
          will-change: opacity, transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .page-in {
            animation-duration: 1ms !important;
          }
        }
      `}</style>

      <div className="w-full max-w-5xl page-in">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            aria-label="Назад"
          >
            <ArrowLeft className="h-4 w-4" />
            {"Назад"}
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
          <header className="mb-6">
            <h1 id="needs-title" className="text-2xl sm:text-3xl font-semibold text-gray-900">
              {"Выберите, что вам нужно"}
            </h1>
            <p className="mt-2 text-gray-700">
              {city
                ? `Город: ${city}${visit ? " • Вариант: " + visitText : ""}`
                : "После выбора города — отметьте нужное"}
            </p>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_NEEDS.map((n) => (
              <NeedButton
                key={n.key}
                title={n.title}
                desc={n.desc}
                selected={selected.has(n.key)}
                onClick={() => toggle(n.key)}
              >
                <n.icon className="h-6 w-6" />
              </NeedButton>
            ))}
          </section>

          <footer className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={handleContinue}
              disabled={selected.size === 0}
              className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors
                ${
                  selected.size > 0
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
            >
              {"Продолжить"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {"Отмена"}
            </button>
          </footer>
        </div>
      </div>
    </main>
  )
}

function NeedButton({
  children,
  title,
  desc,
  selected,
  onClick,
}: {
  children: React.ReactNode
  title: string
  desc: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative w-full rounded-xl border p-5 text-left transition-all
        ${selected ? "border-emerald-600 bg-emerald-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}
    >
      <span
        className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
          ${selected ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500"}`}
        aria-hidden="true"
      >
        <CheckCircle2 className={`h-3.5 w-3.5 ${selected ? "" : "opacity-60"}`} />
        {selected ? "Выбрано" : "Не выбрано"}
      </span>

      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 rounded-lg p-2 ${selected ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}
        >
          {children}
        </div>
        <div>
          <div className={`font-semibold ${selected ? "text-emerald-800" : "text-gray-900"}`}>{title}</div>
          <div className={`text-sm mt-1 ${selected ? "text-emerald-700" : "text-gray-600"}`}>{desc}</div>
        </div>
      </div>
    </button>
  )
}

function visitLabel(v: VisitType) {
  switch (v) {
    case "short":
      return "Короткая поездка"
    case "weeks":
      return "На пару недель"
    case "months":
      return "На несколько месяцев"
    case "long":
      return "Остаться подольше"
    default:
      return ""
  }
}
