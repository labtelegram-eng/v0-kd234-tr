"use client"

import { useState, useEffect } from "react"
import { Clock } from 'lucide-react'
import { WidgetCard } from "./widget-card"

export function TimeWidget() {
  const [time, setTime] = useState<string>("")
  const [date, setDate] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const bangkokTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }))

      setTime(
        bangkokTime.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      )

      setDate(
        bangkokTime.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
        }),
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <WidgetCard
      title="Время в Бангкоке"
      icon={<Clock className="w-3.5 h-3.5" />}
      color="violet"
      primary={time || "—"}
      secondary={date || ""}
    />
  )
}
