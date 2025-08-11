"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Save, X, Trash2, ArrowUp, ArrowDown } from 'lucide-react'

type WidgetType = "time" | "safety" | "emergency" | "embassy" | "tourist-help" | "custom"
type SafetyStatus = "safe" | "medium" | "danger"

type Widget = {
id: number
type: WidgetType
title: string
isActive: boolean
order: number
settings: Record<string, any>
}

export function NewsWidgetsSection() {
const [widgets, setWidgets] = useState<Widget[]>([])
const [editing, setEditing] = useState<Widget | null>(null)
const [form, setForm] = useState<Partial<Widget>>({
  type: "custom",
  title: "",
  isActive: true,
  order: 1,
  settings: { color: "gray" },
})
const [error, setError] = useState<string>("")
const [isOpen, setIsOpen] = useState(false)

const reload = async () => {
  const res = await fetch("/api/news-widgets")
  const data = await res.json()
  setWidgets((data.widgets || []).sort((a: Widget, b: Widget) => a.order - b.order))
}

useEffect(() => {
  reload()
}, [])

const startCreate = () => {
  setEditing(null)
  setForm({
    type: "custom",
    title: "",
    isActive: true,
    order: (widgets.at(-1)?.order ?? 0) + 1,
    settings: { color: "gray" },
  })
  setIsOpen(true)
}

const startEdit = (w: Widget) => {
  setEditing(w)
  setForm({
    id: w.id,
    type: w.type,
    title: w.title,
    isActive: w.isActive,
    order: w.order,
    settings: { ...w.settings },
  })
  setIsOpen(true)
}

const cancel = () => {
  setIsOpen(false)
  setEditing(null)
  setForm({
    type: "custom",
    title: "",
    isActive: true,
    order: (widgets.at(-1)?.order ?? 0) + 1,
    settings: { color: "gray" },
  })
  setError("")
}

const save = async () => {
  setError("")
  try {
    if (!form.title || !form.type) {
      setError("Заполните тип и название виджета")
      return
    }
    const payload: any = {
      type: form.type,
      title: form.title,
      isActive: form.isActive ?? true,
      order: form.order ?? (widgets.at(-1)?.order ?? 0) + 1,
      settings: form.settings ?? {},
    }

    if (form.type === "safety") {
      // Normalize safety color by status and validations
      const status: SafetyStatus = payload.settings.status || "safe"
      if (status === "medium" || status === "danger") {
        if (!payload.settings.reason) {
          setError("Для статуса Неспокойно/Опасно укажите причину")
          return
        }
      }
    }

    if (editing?.id) {
      const res = await fetch(`/api/news-widgets/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Ошибка обновления")
    } else {
      const res = await fetch("/api/news-widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Ошибка создания")
    }
    await reload()
    cancel()
  } catch (e: any) {
    setError(e.message || "Ошибка сохранения")
  }
}

const toggle = async (w: Widget) => {
  const res = await fetch(`/api/news-widgets/${w.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive: !w.isActive }),
  })
  if (res.ok) reload()
}

const remove = async (w: Widget) => {
  if (!confirm("Удалить виджет?")) return
  const res = await fetch(`/api/news-widgets/${w.id}`, { method: "DELETE" })
  if (res.ok) reload()
}

const move = async (w: Widget, dir: -1 | 1) => {
  const idx = widgets.findIndex(i => i.id === w.id)
  const swapIdx = idx + dir
  if (swapIdx < 0 || swapIdx >= widgets.length) return
  const a = widgets[idx]
  const b = widgets[swapIdx]
  // swap orders
  await fetch(`/api/news-widgets/${a.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order: b.order }),
  })
  await fetch(`/api/news-widgets/${b.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order: a.order }),
  })
  reload()
}

const safetyStatus = form.settings?.status as SafetyStatus | undefined

const safetyColorHint = useMemo(() => {
  if (form.type !== "safety") return ""
  if (safetyStatus === "danger") return "Внутренний цвет: красный"
  if (safetyStatus === "medium") return "Внутренний цвет: желтый"
  return "Внутренний цвет: зеленый"
}, [form.type, safetyStatus])

return (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">Виджеты новостей</h2>
      <Button onClick={startCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Новый виджет
      </Button>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      {widgets.map(w => (
        <Card key={w.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{w.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => move(w, -1)} aria-label="Вверх">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => move(w, 1)} aria-label="Вниз">
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              <div>Тип: {w.type}</div>
              <div>Порядок: {w.order}</div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={w.isActive} onCheckedChange={() => toggle(w)} />
              <span className="text-sm">{w.isActive ? "Активен" : "Скрыт"}</span>
              <Button variant="outline" size="sm" onClick={() => startEdit(w)}>Редактировать</Button>
              <Button variant="destructive" size="icon" onClick={() => remove(w)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {isOpen && (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">
            {editing ? "Редактирование виджета" : "Создание виджета"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={cancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">{error}</div>}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Тип</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm(f => ({ ...f, type: e.target.value as WidgetType }))}
              >
                <option value="time">Время</option>
                <option value="safety">Безопасность</option>
                <option value="emergency">Экстренные службы</option>
                <option value="embassy">Посольство</option>
                <option value="tourist-help">Помощь туристам</option>
                <option value="custom">Пользовательский</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Название</Label>
              <Input
                value={form.title ?? ""}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Название виджета"
              />
            </div>
            <div className="space-y-2">
              <Label>Порядок</Label>
              <Input
                type="number"
                value={form.order ?? 1}
                onChange={(e) => setForm(f => ({ ...f, order: Number(e.target.value || 0) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Активен</Label>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.isActive ?? true}
                  onCheckedChange={(v) => setForm(f => ({ ...f, isActive: v }))}
                />
                <span className="text-sm">{(form.isActive ?? true) ? "Да" : "Нет"}</span>
              </div>
            </div>
          </div>

          {/* Type-specific settings */}
          {form.type === "time" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Часовой пояс</Label>
                <Input
                  value={form.settings?.timezone ?? "Asia/Bangkok"}
                  onChange={(e) =>
                    setForm(f => ({ ...f, settings: { ...(f.settings ?? {}), timezone: e.target.value } }))
                  }
                  placeholder="Asia/Bangkok"
                />
              </div>
              <div className="space-y-2">
                <Label>Формат</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.settings?.format ?? "24h"}
                  onChange={(e) =>
                    setForm(f => ({ ...f, settings: { ...(f.settings ?? {}), format: e.target.value } }))
                  }
                >
                  <option value="24h">24 часа</option>
                  <option value="12h">12 часов</option>
                </select>
              </div>
            </div>
          )}

          {form.type === "safety" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Статус</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.settings?.status ?? "safe"}
                  onChange={(e) =>
                    setForm(f => ({ ...f, settings: { ...(f.settings ?? {}), status: e.target.value } }))
                  }
                >
                  <option value="safe">Безопасно</option>
                  <option value="medium">Неспокойно</option>
                  <option value="danger">Опасно</option>
                </select>
                <p className="text-xs text-gray-500">{safetyColorHint}</p>
              </div>
              <div className="space-y-2">
                <Label>Уровень (текст)</Label>
                <Input
                  value={form.settings?.level ?? ""}
                  onChange={(e) =>
                    setForm(f => ({ ...f, settings: { ...(f.settings ?? {}), level: e.target.value } }))
                  }
                  placeholder="Безопасно"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Причина</Label>
                <Input
                  value={form.settings?.reason ?? ""}
                  onChange={(e) =>
                    setForm(f => ({ ...f, settings: { ...(f.settings ?? {}), reason: e.target.value } }))
                  }
                  placeholder="Краткое описание причины"
                />
              </div>
              <div className="space-y-2">
                <Label>ID связанной новости (необязательно)</Label>
                <Input
                  type="number"
                  value={form.settings?.relatedNewsId ?? ""}
                  onChange={(e) =>
                    setForm(f => ({
                      ...f,
                      settings: { ...(f.settings ?? {}), relatedNewsId: Number(e.target.value || 0) || undefined },
                    }))
                  }
                  placeholder="Например: 101"
                />
              </div>
            </div>
          )}

          {form.type !== "time" && form.type !== "safety" && (
            <div className="space-y-2">
              <Label>Содержимое</Label>
              <Input
                value={form.settings?.content ?? ""}
                onChange={(e) =>
                  setForm(f => ({ ...f, settings: { ...(f.settings ?? {}), content: e.target.value } }))
                }
                placeholder="Текст виджета"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={cancel}>
              Отмена
            </Button>
            <Button onClick={save}>
              <Save className="mr-2 h-4 w-4" />
              Сохранить
            </Button>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
)
}

export default NewsWidgetsSection
