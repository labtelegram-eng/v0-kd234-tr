"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ImageIcon, Code2, SettingsIcon, Save, Send, ArrowLeft } from 'lucide-react'
import { AdminHeader } from "@/components/admin/admin-header"

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
}

export default function WritePage() {
  const router = useRouter()
  const { toast } = useToast()
  const editorRef = useRef<HTMLDivElement>(null)

  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState<"blog" | "news">("blog")
  const [slug, setSlug] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [openSettings, setOpenSettings] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Auto-generate slug from title
  useEffect(() => {
    if (!slug && title) {
      setSlug(slugify(title))
    }
  }, [title, slug])

  // Load draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("admin-write-draft")
    if (saved) {
      const d = JSON.parse(saved)
      setTitle(d.title || "")
      setAuthor(d.author || "")
      setContent(d.content || "")
      setType(d.type || "blog")
      setSlug(d.slug || "")
      setCoverImage(d.coverImage || "")
    }
  }, [])

  // Auto-save draft
  useEffect(() => {
    const id = setInterval(() => {
      localStorage.setItem(
        "admin-write-draft",
        JSON.stringify({ title, author, content, type, slug, coverImage })
      )
    }, 3000)
    return () => clearInterval(id)
  }, [title, author, content, type, slug, coverImage])

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    // Sync state
    setContent(editorRef.current?.innerHTML || "")
  }

  const insertImageByUrl = () => {
    const url = prompt("Вставьте URL изображения")
    if (url) {
      exec("insertImage", url)
    }
  }

  const insertCodeBlock = () => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    const pre = document.createElement("pre")
    pre.className = "bg-gray-100 rounded-md p-3 overflow-x-auto text-sm"
    pre.textContent = "```code```"
    range.insertNode(pre)
    // Move caret after the node
    range.setStartAfter(pre)
    range.setEndAfter(pre)
    sel.removeAllRanges()
    sel.addRange(range)
    setContent(editorRef.current?.innerHTML || "")
  }

  const save = async (status: "draft" | "published") => {
    if (!title || !slug || !content) {
      toast({ title: "Заполните заголовок и содержимое", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/editor/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, author, slug, content, coverImage, status }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Ошибка сохранения")
      }
      toast({ title: status === "published" ? "Опубликовано" : "Черновик сохранен" })
      // Optionally clear draft on publish
      if (status === "published") {
        localStorage.removeItem("admin-write-draft")
      }
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Keep the admin header for consistency */}
      <AdminHeader user={{ id: 1, username: "admin", role: "admin" } as any} />

      {/* Top actions bar */}
      <header className="sticky top-16 z-10 flex items-center justify-between px-6 py-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="text-gray-600" onClick={() => router.push("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад в админку
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => save("draft")}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>

          <Dialog open={openSettings} onOpenChange={setOpenSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-full">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Настройки
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Настройки публикации</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Тип материала</Label>
                  <Select value={type} onValueChange={(v: "blog" | "news") => setType(v)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Блог</SelectItem>
                      <SelectItem value="news">Новости</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="slug">Адрес (slug)</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="naprimer-moya-statya"
                  />
                  <p className="text-xs text-gray-500">
                    Итоговый URL: {type === "blog" ? "/blog/" : "/news/"}{slug || "<slug>"}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cover">Обложка (URL)</Label>
                  <Input
                    id="cover"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setOpenSettings(false)} variant="outline">Готово</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            className="rounded-full border border-gray-800"
            variant="default"
            onClick={() => save("published")}
            disabled={isSaving}
          >
            <Send className="w-4 h-4 mr-2" />
            PUBLISH
          </Button>
        </div>
      </header>

      {/* Editor canvas */}
      <main className="max-w-3xl mx-auto px-6 pt-10 pb-24">
        {/* Title */}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border-0 focus-visible:ring-0 text-4xl font-light px-0"
        />

        {/* Author */}
        <div className="mt-2">
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
            className="border-0 focus-visible:ring-0 text-gray-500 px-0"
          />
        </div>

        {/* Tiny toolbar like Telegraph (code + image) */}
        <div className="mt-4 flex items-center gap-2 text-gray-700">
          <button
            aria-label="Код"
            onClick={insertCodeBlock}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Код"
          >
            <Code2 className="w-4 h-4" />
          </button>
          <button
            aria-label="Изображение"
            onClick={insertImageByUrl}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Изображение по ссылке"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>

        {/* ContentEditable area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={(e) => setContent((e.target as HTMLDivElement).innerHTML)}
          className="mt-6 min-h-[50vh] outline-none prose max-w-none text-gray-900"
          style={{ whiteSpace: "pre-wrap" }}
          suppressContentEditableWarning
        >
        </div>

        {/* Placeholder */}
        {(!content || content === "<br>") && (
          <p className="text-gray-400 mt-2 select-none pointer-events-none">Your story...</p>
        )}
      </main>
    </div>
  )
}
