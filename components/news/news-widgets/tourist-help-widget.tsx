"use client"

import { useState } from "react"
import { Info } from 'lucide-react'
import { WidgetCard } from "./widget-card"

export function TouristHelpWidget() {
  const [copied, setCopied] = useState(false)
  const phoneNumber = "1672"

  const handleClick = async () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
    if (isMobile) {
      window.location.href = `tel:${phoneNumber}`
    }
    try {
      await navigator.clipboard.writeText(phoneNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Ошибка копирования:", err)
    }
  }

  return (
    <WidgetCard
      title="Помощь туристам"
      icon={<Info className="w-3.5 h-3.5" />}
      color="emerald"
      primary={copied ? "Скопировано!" : phoneNumber}
      secondary="Горячая линия"
      onClick={handleClick}
      aria-label="Помощь туристам - горячая линия 1672"
    />
  )
}
