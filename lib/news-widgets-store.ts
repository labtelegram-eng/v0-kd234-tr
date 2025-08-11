export type WidgetType = "time" | "safety" | "emergency" | "embassy" | "tourist-help" | "custom"

export type SafetyStatus = "safe" | "medium" | "danger"

export interface WidgetSettings {
icon?: string
color?: string
bgColor?: string
content?: string
phone?: string
description?: string
timezone?: string
format?: "12h" | "24h"
status?: SafetyStatus
level?: string
reason?: string
relatedNewsId?: number
}

export interface NewsWidget {
id: number
type: WidgetType
title: string
isActive: boolean
order: number
settings: WidgetSettings
createdAt: string
updatedAt: string
}

// Module-level in-memory store (persists for the session).
let nextId = 6
let widgets: NewsWidget[] = [
{
  id: 1,
  type: "time",
  title: "Время в Бангкоке",
  isActive: true,
  order: 1,
  settings: {
    timezone: "Asia/Bangkok",
    format: "24h",
    icon: "Clock",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 2,
  type: "safety",
  title: "Безопасность",
  isActive: true,
  order: 2,
  settings: {
    status: "safe",
    level: "Безопасно",
    reason: "Обычная туристическая активность",
    color: "emerald",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 3,
  type: "emergency",
  title: "Службы",
  isActive: true,
  order: 3,
  settings: {
    phone: "191",
    description: "Полиция",
    icon: "Phone",
    color: "red",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 4,
  type: "embassy",
  title: "Посольство РФ",
  isActive: true,
  order: 4,
  settings: {
    phone: "+66 2 234 0993",
    description: "Бангкок",
    icon: "MapPin",
    color: "violet",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 5,
  type: "tourist-help",
  title: "Помощь туристам",
  isActive: true,
  order: 5,
  settings: {
    phone: "1672",
    description: "Горячая линия",
    icon: "Info",
    color: "emerald",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
]

function sortByOrder(a: NewsWidget, b: NewsWidget) {
return a.order - b.order
}

export function getWidgets(): NewsWidget[] {
return [...widgets].sort(sortByOrder)
}

export function getWidget(id: number): NewsWidget | undefined {
return widgets.find(w => w.id === id)
}

export function createWidget(input: Omit<NewsWidget, "id" | "createdAt" | "updatedAt">): NewsWidget {
const now = new Date().toISOString()
const widget: NewsWidget = {
  ...input,
  id: nextId++,
  createdAt: now,
  updatedAt: now,
}
widgets.push(widget)
widgets.sort(sortByOrder)
return widget
}

export function updateWidget(
id: number,
patch: Partial<Omit<NewsWidget, "id" | "createdAt">>
): NewsWidget | undefined {
const index = widgets.findIndex(w => w.id === id)
if (index === -1) return undefined
const prev = widgets[index]
const updated: NewsWidget = {
  ...prev,
  ...patch,
  settings: { ...prev.settings, ...(patch.settings ?? {}) },
  updatedAt: new Date().toISOString(),
}
widgets[index] = updated
widgets.sort(sortByOrder)
return updated
}

export function deleteWidget(id: number): boolean {
const before = widgets.length
widgets = widgets.filter(w => w.id !== id)
return widgets.length < before
}

export function replaceAll(all: NewsWidget[]) {
widgets = [...all]
// Re-ensure order
widgets.sort(sortByOrder)
// Fix nextId
nextId = Math.max(0, ...widgets.map(w => w.id)) + 1
}
