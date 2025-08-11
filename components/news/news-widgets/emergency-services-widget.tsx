"use client"

import { useState } from "react"
import { Phone } from 'lucide-react'
import { WidgetCard } from "./widget-card"

export function EmergencyServicesWidget() {
  const [copied, setCopied] = useState(false)
  const phoneNumber = "191"

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
      title="Службы"
      icon={<Phone className="w-3.5 h-3.5" />}
      color="red"
      primary={copied ? "Скопировано!" : phoneNumber}
      secondary="Полиция"
      onClick={handleClick}
      aria-label="Экстренные службы - позвонить 191"
    />
  )
}
