"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function VisitIntentPage() {
  const router = useRouter()
  const [visitType, setVisitType] = useState<"short" | "long" | null>(null)

  const handleContinue = () => {
    // Placeholder: advance to the next step with the selection
    // For example: router.push(`/planner/preferences?visit=${visitType}`)
    // eslint-disable-next-line no-console
    console.log("visitType:", visitType)
  }

  return (
    <main
      className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-8"
      aria-labelledby="visit-intent-title"
    >
      <style jsx>{`
        @keyframes fadeSlideIn {
          0% { opacity: 0; transform: translateY(10px) scale(0.985); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .page-in {
          animation: fadeSlideIn 320ms cubic-bezier(0.16, 1, 0.3, 1) both;
          will-change: opacity, transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .page-in { animation-duration: 1ms !important; }
        }
      `}</style>

      <div className="w-full max-w-3xl page-in">
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
          <header className="mb-4 sm:mb-6">
            <h1 id="visit-intent-title" className="text-2xl sm:text-3xl font-semibold text-gray-900">
              {"Для начала — уточним цель поездки"}
            </h1>
            <p className="mt-2 text-gray-700">
              {"Вы турист на короткий срок или планируете задержаться в Таиланде подольше?"}
            </p>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setVisitType("short")}
              className={`group w-full rounded-xl border p-5 text-left transition-all
                ${
                  visitType === "short"
                    ? "border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              aria-pressed={visitType === "short"}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{"✈️"}</span>
                <div>
                  <div className="text-gray-900 font-semibold">{"Короткая поездка"}</div>
                  <div className="text-gray-600 text-sm">{"3–14 дней, основные места и маршруты"}</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setVisitType("long")}
              className={`group w-full rounded-xl border p-5 text-left transition-all
                ${
                  visitType === "long"
                    ? "border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              aria-pressed={visitType === "long"}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{"🏡"}</span>
                <div>
                  <div className="text-gray-900 font-semibold">{"Остаться подольше"}</div>
                  <div className="text-gray-600 text-sm">{"От месяца и дольше, комфорт и инфраструктура"}</div>
                </div>
              </div>
            </button>
          </section>

          <footer className="mt-6 flex items-center gap-3">
            <button
              type="button"
              disabled={!visitType}
              onClick={handleContinue}
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
