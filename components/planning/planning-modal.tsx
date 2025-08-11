"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  X,
  ArrowLeft,
  MapPin,
  Star,
  Home,
  Car,
  Stamp,
  UtensilsCrossed,
  PartyPopper,
  Trees,
  ShoppingBag,
  HeartPulse,
  Wifi,
  Building2,
  Wine,
  Loader2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

type Origin = { x: number; y: number } | null

export interface PlanningModalProps {
  open?: boolean
  origin?: Origin
  onClose?: () => void
}

type View = "trip" | "city" | "needs" | "loading"
type Direction = "forward" | "back"
type VisitType = "short" | "weeks" | "months" | "long" | null

const POPULAR_CITIES: { label: string; name: string }[] = [
  { label: "Бангкок", name: "Бангкок" },
  { label: "Пхукет", name: "Пхукет" },
  { label: "Паттайя", name: "Паттайя" },
  { label: "Ко Самуи", name: "Ко Самуи" },
  { label: "Чиангмай", name: "Чиангмай" },
  { label: "Краби", name: "Краби" },
]

type City = { name: string; native?: string }

// 12 fixed need categories
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

type NeedDef = {
  key: NeedKey
  title: string
  subtitle: string
  icon: LucideIcon
  accent?: boolean
}

export default function PlanningModal({ open = false, origin = null, onClose = () => {} }: PlanningModalProps) {
  const router = useRouter()

  // Keep the modal in the DOM while animating out
  const [shouldRender, setShouldRender] = useState(open)
  const [isClosing, setIsClosing] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  // Flow state: start at "trip" for correct sequence
  const [view, setView] = useState<View>("trip")
  const [visitType, setVisitType] = useState<VisitType>(null)

  // City search state
  const [allCities, setAllCities] = useState<City[]>([])
  const [cityQuery, setCityQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [highlightIndex, setHighlightIndex] = useState(0)

  // Needs selection state
  const [needs, setNeeds] = useState<Set<NeedKey>>(new Set())

  // Loading view state
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const loadingIntervalRef = useRef<number | null>(null)
  const messageIntervalRef = useRef<number | null>(null)
  const loadingTimeoutRef = useRef<number | null>(null)

  // Content transition state
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle")
  const [direction, setDirection] = useState<Direction>("forward")
  const contentTimerRef = useRef<number | null>(null)

  const CLOSE_ANIM_MS = 560

  // Mount/unmount with animation
  useEffect(() => {
    if (open) {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      setIsClosing(false)
      setShouldRender(true)
      // Always reset flow on open
      setView("trip")
      setVisitType(null)
      setSelectedCity(null)
      setNeeds(new Set())
      return
    }
    if (shouldRender) {
      setIsClosing(true)
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = window.setTimeout(() => {
        setShouldRender(false)
        setIsClosing(false)
        closeTimerRef.current = null
      }, CLOSE_ANIM_MS)
    }
  }, [open, shouldRender])

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      if (contentTimerRef.current) {
        window.clearTimeout(contentTimerRef.current)
        contentTimerRef.current = null
      }
      stopLoadingTimers()
    }
  }, [])

  // Lock scroll while modal is rendered
  useEffect(() => {
    if (!shouldRender) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [shouldRender])

  // Close on ESC
  useEffect(() => {
    if (!shouldRender) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [shouldRender, onClose])

  // Compute animation origin variables
  const styleVars = useMemo(() => {
    const x = origin ? `${origin.x}px` : "50vw"
    const y = origin ? `${origin.y}px` : "50vh"
    return {
      ["--origin-x" as any]: x,
      ["--origin-y" as any]: y,
    }
  }, [origin])

  // Fetch cities once
  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetch("/data/thai-cities.json")
        const data = await res.json()
        if (!active) return
        const cities: City[] = (data?.cities ?? []) as City[]
        cities.sort((a, b) => a.name.localeCompare(b.name))
        setAllCities(cities)
      } catch {
        const fallback: City[] = [
          { name: "Bangkok", native: "กรุงเทพมหานคร" },
          { name: "Phuket" },
          { name: "Pattaya" },
          { name: "Ko Samui" },
          { name: "Chiang Mai" },
          { name: "Krabi" },
        ]
        setAllCities(fallback)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  // Smooth content transition
  const goToView = (next: View, dir: Direction) => {
    if (contentTimerRef.current) {
      window.clearTimeout(contentTimerRef.current)
      contentTimerRef.current = null
    }
    setDirection(dir)
    setPhase("out")
    contentTimerRef.current = window.setTimeout(() => {
      setView(next)
      setPhase("in")
      contentTimerRef.current = window.setTimeout(() => {
        setPhase("idle")
        contentTimerRef.current = null
      }, 260)
    }, 200)
  }

  const handleBack = () => {
    if (view === "loading") {
      stopLoadingTimers()
      goToView("needs", "back")
      return
    }
    if (view === "needs") {
      goToView("city", "back")
      return
    }
    if (view === "city") {
      goToView("trip", "back")
      return
    }
    // view === "trip"
    onClose()
  }

  const handleContinueFromTrip = () => {
    goToView("city", "forward")
  }

  const handleContinueFromCity = () => {
    if (!selectedCity || !selectedCity.name) return
    goToView("needs", "forward")
  }

  const handleFinishNeeds = () => {
    // Start loading flow
    setLoadingProgress(0)
    setLoadingMessageIndex(0)
    startLoadingTimers()
    goToView("loading", "forward")
  }

  const loadingMessages = [
    "Ищем информацию",
    "Подбираем подходящее жильё",
    "Сверяем цены и условия",
    "Ищем варианты виз и страховки",
    "Проверяем транспорт и туры",
    "Формируем черновик плана",
  ]

  function startLoadingTimers() {
    stopLoadingTimers()
    const totalMs = 8000
    const tickMs = 100
    const steps = totalMs / tickMs
    const delta = 100 / steps

    loadingIntervalRef.current = window.setInterval(() => {
      setLoadingProgress((p) => Math.min(100, p + delta))
    }, tickMs)

    messageIntervalRef.current = window.setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % loadingMessages.length)
    }, 1500)

    loadingTimeoutRef.current = window.setTimeout(() => {
      // On finish, redirect to full editor page with data in query params
      const params = new URLSearchParams()
      if (selectedCity?.name) params.set("city", selectedCity.name)
      if (visitType) params.set("visit", visitType)
      params.set("needs", Array.from(needs).join(","))
      stopLoadingTimers()
      onClose()
      router.push(`/planner/editor?${params.toString()}`)
    }, totalMs)
  }

  function stopLoadingTimers() {
    if (loadingIntervalRef.current) {
      window.clearInterval(loadingIntervalRef.current)
      loadingIntervalRef.current = null
    }
    if (messageIntervalRef.current) {
      window.clearInterval(messageIntervalRef.current)
      messageIntervalRef.current = null
    }
    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
  }

  const headerTitle =
    view === "trip"
      ? "Для начала — уточним цель поездки"
      : view === "city"
        ? "Где вы сейчас находитесь?"
        : view === "needs"
          ? "Выберите, что вам нужно"
          : "Создаём редактор"

  const headerSubtitle =
    view === "trip"
      ? "Выберите предполагаемую длительность поездки"
      : view === "city"
        ? "Укажите город в Таиланде, в котором вы сейчас находитесь"
        : view === "needs"
          ? "Отметьте услуги и опции, которые вы хотите подобрать"
          : "Готовим данные, это займёт около 8 секунд"

  const pinnedNames = useMemo(() => new Set(POPULAR_CITIES.map((p) => p.name)), [])

  const allCitiesWithPinned = useMemo(() => {
    return allCities.map((city) => ({
      ...city,
      isPinned: pinnedNames.has(city.name),
      label: POPULAR_CITIES.find((p) => p.name === city.name)?.label || city.name,
    }))
  }, [allCities, pinnedNames])

  const filtered = useMemo(() => {
    const q = normalize(cityQuery)
    let results = allCitiesWithPinned

    if (q) {
      results = allCitiesWithPinned.filter((c) => {
        const en = normalize(c.name)
        const th = normalize(c.native || "")
        const label = normalize(c.label)
        return en.includes(q) || th.includes(q) || label.includes(q)
      })
    }

    return results.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return 0
    })
  }, [allCitiesWithPinned, cityQuery])

  // Keep highlight index in bounds on filter change
  useEffect(() => {
    if (highlightIndex >= filtered.length) {
      setHighlightIndex(Math.max(0, filtered.length - 1))
    }
  }, [filtered.length, highlightIndex])

  function normalize(s: string) {
    return s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  }

  const selectCity = (c: City) => {
    setSelectedCity(c)
  }

  if (!shouldRender) return null

  return (
    <div
      className={`fixed inset-0 z-[1300] ${isClosing ? "animate-pulse opacity-0" : "animate-in fade-in duration-500"}`}
      style={styleVars as React.CSSProperties}
      aria-modal="true"
      role="dialog"
      aria-labelledby="planning-title"
    >
      {/* Background overlay */}
      <div
        className={`absolute inset-0 bg-white/95 backdrop-blur-sm ${isClosing ? "animate-out fade-out duration-500" : "animate-in fade-in duration-500"}`}
      />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 z-[1310] inline-flex items-center justify-center rounded-full p-2.5
bg-white/90 hover:bg-white text-gray-700 shadow-md focus:outline-none focus-visible:ring-2
focus-visible:ring-emerald-500 transition-colors"
        aria-label="Закрыть модальное окно"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Center content area */}
      <main className="relative z-[1305] min-h-screen w-full flex items-center justify-center p-4 sm:p-6">
        <section
          className={`relative mx-auto w-full max-w-5xl h-[clamp(560px,80vh,860px)] max-h-[calc(100vh-2rem)] overflow-hidden ${isClosing ? "animate-out slide-out-to-bottom-2 fade-out duration-500" : "animate-in slide-in-from-bottom-2 fade-in duration-500 delay-100"}`}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 mx-auto max-w-3xl text-center px-2 pt-6 pb-4 bg-white/80 backdrop-blur-sm z-10">
            <h2
              id="planning-title"
              aria-live="polite"
              className="text-gray-900 text-2xl sm:text-3xl font-semibold tracking-tight"
            >
              {headerTitle}
            </h2>
            <p className="mt-2 text-gray-700 text-sm sm:text-base">{headerSubtitle}</p>
          </div>

          {/* Animated content */}
          <div
            className={`pt-24 sm:pt-28 h-full flex items-center justify-center px-2 ${
              phase === "out"
                ? direction === "forward"
                  ? "animate-out slide-out-to-left-2 fade-out duration-200"
                  : "animate-out slide-out-to-right-2 fade-out duration-200"
                : phase === "in"
                  ? direction === "forward"
                    ? "animate-in slide-in-from-right-2 fade-in duration-300"
                    : "animate-in slide-in-from-left-2 fade-in duration-300"
                  : ""
            }`}
          >
            {view === "trip" ? (
              <TripView
                onBack={handleBack}
                visitType={visitType}
                onSelectVisit={setVisitType}
                onContinue={handleContinueFromTrip}
              />
            ) : view === "city" ? (
              <CityView
                onBack={handleBack}
                cityQuery={cityQuery}
                setCityQuery={setCityQuery}
                filtered={filtered}
                highlightIndex={highlightIndex}
                setHighlightIndex={setHighlightIndex}
                selectedCity={selectedCity}
                selectCity={selectCity}
                onContinue={handleContinueFromCity}
              />
            ) : view === "needs" ? (
              <NeedsView
                selectedCity={selectedCity}
                visitType={visitType}
                needs={needs}
                setNeeds={setNeeds}
                onBack={handleBack}
                onContinue={handleFinishNeeds}
              />
            ) : (
              <LoadingView progress={loadingProgress} message={loadingMessages[loadingMessageIndex]} />
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

function TripView({
  onBack,
  visitType,
  onSelectVisit,
  onContinue,
}: {
  onBack: () => void
  visitType: VisitType
  onSelectVisit: (t: VisitType) => void
  onContinue: () => void
}) {
  return (
    <div className="w-full max-w-3xl">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Назад"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {"Назад"}
      </button>

      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TripOption
          selected={visitType === "short"}
          onClick={() => onSelectVisit("short")}
          emoji="✈️"
          title="Короткая поездка"
          desc="3–14 дней, основные места и маршруты"
        />
        <TripOption
          selected={visitType === "weeks"}
          onClick={() => onSelectVisit("weeks")}
          emoji="🗓️"
          title="На пару недель"
          desc="15–30 дней, успеть больше и без спешки"
        />
        <TripOption
          selected={visitType === "months"}
          onClick={() => onSelectVisit("months")}
          emoji="🧳"
          title="На несколько месяцев"
          desc="1–3 месяца, комфорт, быт и инфраструктура"
        />
        <TripOption
          selected={visitType === "long"}
          onClick={() => onSelectVisit("long")}
          emoji="🏡"
          title="Остаться подольше"
          desc="3+ месяцев: удалёнка, учёба, зимовка"
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          disabled={!visitType}
          onClick={onContinue}
          className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors
            ${
              visitType
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
        >
          {"Продолжить"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          {"Отмена"}
        </button>
      </div>
    </div>
  )
}

function CityView({
  onBack,
  cityQuery,
  setCityQuery,
  filtered,
  highlightIndex,
  setHighlightIndex,
  selectedCity,
  selectCity,
  onContinue,
}: {
  onBack: () => void
  cityQuery: string
  setCityQuery: (v: string) => void
  filtered: any[]
  highlightIndex: number
  setHighlightIndex: (i: number) => void
  selectedCity: City | null
  selectCity: (c: City) => void
  onContinue: () => void
}) {
  return (
    <div className="w-full max-w-3xl h-full flex flex-col">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
        aria-label="Назад"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {"Назад"}
      </button>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-shrink-0 mb-3">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            {"Введите или выберите город"}
          </label>
          <div className="relative">
            <Input
              id="city"
              placeholder="Например: Бангкок, Пхукет, Чиангмай"
              value={cityQuery}
              onChange={(e) => {
                setCityQuery(e.target.value)
                setHighlightIndex(0)
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault()
                  setHighlightIndex(Math.min(highlightIndex + 1, Math.max(0, filtered.length - 1)))
                } else if (e.key === "ArrowUp") {
                  e.preventDefault()
                  setHighlightIndex(Math.max(0, highlightIndex - 1))
                } else if (e.key === "Enter") {
                  e.preventDefault()
                  const item = filtered[highlightIndex]
                  if (item) {
                    selectCity(item)
                  }
                }
              }}
              className="pr-24"
            />

            <MapPin className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

            <button
              type="button"
              onClick={() => {
                setCityQuery("")
                selectCity({ name: "" })
                setHighlightIndex(0)
              }}
              className={`absolute right-10 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors ${
                cityQuery ? "text-gray-500 hover:text-gray-700" : "invisible"
              }`}
              aria-label="Очистить поле поиска"
              title="Очистить"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 rounded-xl bg-white border border-gray-200 p-1 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-4 text-sm text-gray-600">{"Ничего не найдено"}</div>
          ) : (
            <div className="h-full overflow-y-auto">
              <ul className="divide-y divide-gray-100">
                {filtered.map((c, idx) => {
                  const selected = selectedCity?.name === c.name
                  const highlighted = idx === highlightIndex
                  return (
                    <li key={`${c.name}-${idx}`}>
                      <button
                        type="button"
                        onMouseEnter={() => setHighlightIndex(idx)}
                        onClick={() => selectCity(c)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          selected ? "bg-emerald-50" : highlighted ? "bg-gray-100" : "bg-transparent hover:bg-gray-100"
                        }`}
                        aria-pressed={selected}
                      >
                        {c.isPinned && <Star className="h-4 w-4 text-amber-500 fill-amber-400" />}
                        <span className="text-gray-900">{c.isPinned ? c.label : c.name}</span>
                        {c.native ? (
                          <span className="text-gray-500 text-xs">
                            {"("}
                            {c.native}
                            {")"}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 mt-3 text-sm text-gray-700">
          {selectedCity && selectedCity.name ? (
            <span>
              {"Вы выбрали: "}
              <strong className="text-gray-900">{selectedCity.name}</strong>
              {selectedCity.native ? (
                <span className="text-gray-500">
                  {" ("}
                  {selectedCity.native}
                  {")"}
                </span>
              ) : null}
            </span>
          ) : (
            <span className="text-gray-500">{"Город не выбран"}</span>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center gap-3 pt-4">
          <button
            type="button"
            disabled={!selectedCity || !selectedCity.name}
            onClick={onContinue}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors
              ${
                selectedCity && selectedCity.name
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
          >
            {"Продолжить"}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            {"Отмена"}
          </button>
        </div>
      </div>
    </div>
  )
}

function NeedsView({
  selectedCity,
  visitType,
  needs,
  setNeeds,
  onBack,
  onContinue,
}: {
  selectedCity: City | null
  visitType: VisitType
  needs: Set<NeedKey>
  setNeeds: React.Dispatch<React.SetStateAction<Set<NeedKey>>>
  onBack: () => void
  onContinue: () => void
}) {
  const needDefs: NeedDef[] = [
    { key: "housing", title: "Жильё", subtitle: "Отели, хостелы, апартаменты, гестхаусы.", icon: Home },
    { key: "transport", title: "Транспорт", subtitle: "Авиабилеты, аренда байка/авто, такси, трансферы.", icon: Car },
    { key: "documents", title: "Визы и документы", subtitle: "Визы, страховка, международные права.", icon: Stamp },
    { key: "food", title: "Еда и напитки", subtitle: "Рестораны, кафе, стритфуд, бары.", icon: UtensilsCrossed },
    {
      key: "entertainment",
      title: "Развлечения",
      subtitle: "Экскурсии, туры, мероприятия, концерты, шоу.",
      icon: PartyPopper,
    },
    {
      key: "nature",
      title: "Природа и активный отдых",
      subtitle: "Пляжи, горы, треккинг, дайвинг, серфинг.",
      icon: Trees,
    },
    { key: "shopping", title: "Шопинг", subtitle: "Рынки, торговые центры, сувениры.", icon: ShoppingBag },
    {
      key: "wellness",
      title: "Здоровье и красота",
      subtitle: "Массаж, спа, салоны красоты, аптеки.",
      icon: HeartPulse,
    },
    { key: "connectivity", title: "Связь и интернет", subtitle: "SIM/eSIM, Wi‑Fi точки, коворкинги.", icon: Wifi },
    { key: "nearby", title: "Полезное рядом", subtitle: "Банки, обменники, заправки, прачечные.", icon: MapPin },
    {
      key: "culture",
      title: "Культура и достопримечательности",
      subtitle: "Храмы, музеи, исторические места.",
      icon: Building2,
    },
    { key: "nightlife", title: "Ночная жизнь", subtitle: "Клубы, бары, вечерние шоу.", icon: Wine },
  ]

  const toggleNeed = (key: NeedKey) => {
    setNeeds((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="w-full max-w-4xl h-full flex flex-col">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
        aria-label="Назад"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {"Назад"}
      </button>

      {/* Summary chip row */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm flex-shrink-0">
        {selectedCity && selectedCity.name ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-700">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            {selectedCity.name}
            {selectedCity.native ? (
              <span className="text-gray-500">
                {" ("}
                {selectedCity.native}
                {")"}
              </span>
            ) : null}
          </span>
        ) : null}
        {visitType && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-700">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            {visitType === "short"
              ? "Короткая поездка"
              : visitType === "weeks"
                ? "На пару недель"
                : visitType === "months"
                  ? "На несколько месяцев"
                  : "Остаться подольше"}
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {needDefs.map((def) => (
            <NeedToggle
              key={def.key}
              selected={needs.has(def.key)}
              onClick={() => toggleNeed(def.key)}
              icon={def.icon}
              title={def.title}
              subtitle={def.subtitle}
            />
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={onContinue}
          className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors
                    ${needs.size > 0 ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-gray-800 text-white hover:bg-gray-900"}`}
        >
          {needs.size > 0 ? "Продолжить" : "Пропустить и продолжить"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          {"Назад"}
        </button>
      </div>
    </div>
  )
}

function LoadingView({ progress, message }: { progress: number; message: string }) {
  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900">
              {message}
              {"…"}
            </div>
            <div className="text-sm text-gray-600">{"Подготавливаем редактор плана"}</div>
          </div>
        </div>

        <div className="mt-5">
          <div
            className="h-2 w-full rounded-full bg-gray-200 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Загрузка редактора"
          >
            <div
              className="h-full bg-emerald-600 transition-[width] duration-150 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {Math.round(progress)}
            {"%"}
          </div>
        </div>
      </div>
    </div>
  )
}

function TripOption({
  selected,
  onClick,
  emoji,
  title,
  desc,
}: {
  selected: boolean
  onClick: () => void
  emoji: string
  title: string
  desc: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group w-full rounded-xl p-5 text-left transition-colors
${selected ? "bg-emerald-50 hover:bg-emerald-100" : "bg-gray-50 hover:bg-gray-100"}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{emoji}</span>
        <div>
          <div className="text-gray-900 font-semibold">{title}</div>
          <div className="text-gray-600 text-sm">{desc}</div>
        </div>
      </div>
    </button>
  )
}

function NeedToggle({
  selected,
  onClick,
  icon: Icon,
  title,
  subtitle,
  accent = false,
}: {
  selected: boolean
  onClick: () => void
  icon: LucideIcon
  title: string
  subtitle: string
  accent?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative w-full rounded-xl border transition-all text-left p-4 sm:p-5
      ${
        selected
          ? "bg-emerald-600 border-emerald-700 text-white shadow-md"
          : "bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
          ${selected ? "bg-emerald-700/70 text-white" : accent ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-700"}`}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className={`font-semibold ${selected ? "text-white" : "text-gray-900"}`}>{title}</div>
          <div className={`mt-0.5 text-sm ${selected ? "text-emerald-50/90" : "text-gray-600"}`}>{subtitle}</div>
        </div>
      </div>

      {selected && (
        <svg aria-hidden="true" className="absolute right-3 top-3 h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
