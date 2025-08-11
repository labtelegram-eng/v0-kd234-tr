"use client"

import { useState } from "react"
import { MapPin } from 'lucide-react'
import { WidgetCard } from "./widget-card"

export function EmbassyWidget() {
  const [copied, setCopied] = useState(false)
  const phoneNumber = "+66 2 234 0993"

  const handleClick = async () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
    if (isMobile) {
      window.location.href = `tel:${phoneNumber.replace(/\s/g, "")}`
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
      title="Посольство РФ"
      icon={<MapPin className="w-3.5 h-3.5" />}
      color="violet"
      primary={copied ? "Скопировано!" : phoneNumber}
      secondary="Бангкок"
      onClick={handleClick}
      aria-label="Посольство РФ в Бангкоке"
    />
  )
}
