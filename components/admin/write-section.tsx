"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { Code2, Settings, Save, Send, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Heading1, Heading2, Heading3, Upload, LinkIcon, EyeIcon, ImageIcon, Trash2, BookOpen } from 'lucide-react'
import {
  PreviewBlogCard,
  PreviewNewsCard,
  PreviewNewsDetail,
  PreviewTimelineItem,
  type PreviewData,
} from "./write-preview-variants"

type ContentType = "blog" | "news"

type DraftItem = {
  id: string
  createdAt: string
  updatedAt: string
  type: ContentType
  title: string
  slug: string
  excerpt: string
  coverImage: string
  html: string
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
}

function stripHtmlToText(html: string) {
  if (!html) return ""
  if (typeof window === "undefined") return html
  const div = document.createElement("div")
  div.innerHTML = html
  return div.textContent || div.innerText || ""
}

/**
 * GhostInput with centered ghost placeholder
 */
function GhostInput(props: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  className?: string
  inputClassName?: string
  "aria-label"?: string
  type?: string
}) {
  const { value, onChange, placeholder, className = "", inputClassName = "", type = "text" } = props
  const [focused, setFocused] = useState(false)
  const showGhost = !focused && value.length === 0

  return (
    <div className={`relative ${className}`}>
      <div
        className={`pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-gray-400 transition-opacity duration-300 ${
          showGhost ? "opacity-100" : "opacity-0"
        }`}
      >
        {placeholder}
      </div>
      <Input
        type={type}
        aria-label={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder=""
        className={[
          "border-0 shadow-none bg-transparent px-0 focus-visible:ring-0 focus:outline-none",
          "relative z-[1]",
          inputClassName,
        ].join(" ")}
      />
    </div>
  )
}

// Utilities for selection handling inside the editor
function isNodeInside(root: HTMLElement | null, node: Node | null): boolean {
  if (!root || !node) return false
  let n: Node | null = node
  while (n) {
    if (n === root) return true
    n = (n as HTMLElement).parentNode
  }
  return false
}

const DRAFTS_KEY = "write-drafts"

function loadDrafts(): DraftItem[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) return arr
    return []
  } catch {
    return []
  }
}

function saveDrafts(drafts: DraftItem[]) {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
}

export function WriteSection() {
  const { toast } = useToast()
  const editorRef = useRef<HTMLDivElement>(null)
  const lastRangeRef = useRef<Range | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState<ContentType>("blog")
  const [slug, setSlug] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const [openSettings, setOpenSettings] = useState(false)
  const [openImageUrl, setOpenImageUrl] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [fontSize, setFontSize] = useState<string>("16")
  const [openPreview, setOpenPreview] = useState(false)
  const [activePreviewTab, setActivePreviewTab] = useState(
    "news-card" as "news-card" | "news-detail" | "timeline" | "blog-card",
  )

  // Drafts modal
  const [openDrafts, setOpenDrafts] = useState(false)
  const [drafts, setDrafts] = useState<DraftItem[]>([])

  // Cover selection states (Popover controls)
  const coverFileInputRefPopover = useRef<HTMLInputElement>(null)
  const [coverUrlInput, setCoverUrlInput] = useState("")

  // Auto-generate slug from title
  useEffect(() => {
    if (!slug && title) setSlug(slugify(title))
  }, [title, slug])

  // Load draft into editor
  useEffect(() => {
    const saved = localStorage.getItem("write-section-draft")
    if (saved) {
      try {
        const d = JSON.parse(saved)
        setTitle(d.title || "")
        setContent(d.content || "")
        setType(d.type || "blog")
        setSlug(d.slug || "")
        setCoverImage(d.coverImage || "")
        setExcerpt(d.excerpt || "")
        if (editorRef.current) editorRef.current.innerHTML = d.content || ""
      } catch {}
    }
  }, [])

  // Load drafts list (local history)
  useEffect(() => {
    setDrafts(loadDrafts())
  }, [])

  // Autosave draft (current working buffer)
  useEffect(() => {
    const id = setInterval(() => {
      localStorage.setItem(
        "write-section-draft",
        JSON.stringify({ title, content, type, slug, coverImage, excerpt }),
      )
    }, 3000)
    return () => clearInterval(id)
  }, [title, content, type, slug, coverImage, excerpt])

  // Keep last selection range inside the editor so toolbar can restore it
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = document.getSelection()
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        if (isNodeInside(editorRef.current, range.commonAncestorContainer)) {
          lastRangeRef.current = range
        }
      }
    }
    document.addEventListener("selectionchange", handleSelectionChange)
    return () => document.removeEventListener("selectionchange", handleSelectionChange)
  }, [])

  const restoreSelection = () => {
    const sel = document.getSelection()
    if (lastRangeRef.current && sel) {
      sel.removeAllRanges()
      sel.addRange(lastRangeRef.current)
    }
  }

  // Formatting helpers
  const exec = (command: string, value?: string) => {
    editorRef.current?.focus()
    restoreSelection()
    document.execCommand(command, false, value)
    setContent(editorRef.current?.innerHTML || "")
  }

  const formatBlock = (block: "P" | "H1" | "H2" | "H3" | "BLOCKQUOTE") => {
    editorRef.current?.focus()
    restoreSelection()
    document.execCommand("formatBlock", false, block)
    setContent(editorRef.current?.innerHTML || "")
  }

  const insertImageAtCaret = (src: string) => {
    if (!src) return
    editorRef.current?.focus()
    restoreSelection()
    const sel = document.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    const img = document.createElement("img")
    img.src = src
    img.alt = ""
    img.style.maxWidth = "100%"
    img.style.borderRadius = "0.5rem"
    img.style.display = "block"
    img.style.margin = "1rem auto"
    range.insertNode(img)
    range.setStartAfter(img)
    range.setEndAfter(img)
    sel.removeAllRanges()
    sel.addRange(range)
    setContent(editorRef.current?.innerHTML || "")
  }

  const insertCodeBlock = () => {
    editorRef.current?.focus()
    restoreSelection()
    const sel = document.getSelection()
    const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null

    const pre = document.createElement("pre")
    pre.style.background = "#f3f4f6"
    pre.style.padding = "0.75rem"
    pre.style.borderRadius = "0.5rem"
    pre.style.overflowX = "auto"
    pre.style.fontSize = "0.9rem"
    pre.style.margin = "1rem 0"

    const code = document.createElement("code")
    const text = range ? range.toString() : ""
    code.textContent = text || "// код"
    pre.appendChild(code)

    if (range) {
      range.deleteContents()
      range.insertNode(pre)
      const p = document.createElement("p")
      p.innerHTML = "<br>"
      pre.parentNode?.insertBefore(p, pre.nextSibling)
      const newRange = document.createRange()
      newRange.setStart(p, 0)
      newRange.collapse(true)
      sel?.removeAllRanges()
      sel?.addRange(newRange)
    } else {
      editorRef.current?.appendChild(pre)
    }
    setContent(editorRef.current?.innerHTML || "")
  }

  const handleImageUploadClick = () => fileInputRef.current?.click()

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Ошибка загрузки")
      }
      const data = await res.json()
      if (data?.imagePath) {
        insertImageAtCaret(data.imagePath)
        toast({ title: "Изображение добавлено" })
      }
    } catch (err: any) {
      toast({ title: "Ошибка загрузки", description: err.message, variant: "destructive" })
    } finally {
      e.target.value = ""
    }
  }

  const handleInsertImageByUrl = () => {
    if (!imageUrl.trim()) return
    insertImageAtCaret(imageUrl.trim())
    setImageUrl("")
    setOpenImageUrl(false)
  }

  // Apply a numeric font size (px) to current selection or caret
  const applyFontSizePx = (px: number) => {
    if (!px || Number.isNaN(px)) return
    editorRef.current?.focus()
    restoreSelection()
    const sel = document.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    const span = document.createElement("span")
    span.style.fontSize = `${px}px`

    if (range.collapsed) {
      const zwsp = document.createTextNode("\u200B")
      span.appendChild(zwsp)
      range.insertNode(span)

      const newRange = document.createRange()
      newRange.setStart(span.firstChild as Text, 1)
      newRange.collapse(true)
      sel.removeAllRanges()
      sel.addRange(newRange)
    } else {
      const contents = range.extractContents()
      span.appendChild(contents)
      range.insertNode(span)

      const newRange = document.createRange()
      newRange.selectNodeContents(span)
      newRange.collapse(false)
      sel.removeAllRanges()
      sel.addRange(newRange)
    }

    setContent(editorRef.current?.innerHTML || "")
  }

  const addToLocalDrafts = () => {
    try {
      const list = loadDrafts()
      const now = new Date().toISOString()
      // Try to update by slug if exists, else add
      const key = (slug || slugify(title) || `draft-${Date.now()}`).toString()
      const idx = list.findIndex((d) => d.slug === key)
      const item: DraftItem = {
        id: idx >= 0 ? list[idx].id : crypto.randomUUID(),
        createdAt: idx >= 0 ? list[idx].createdAt : now,
        updatedAt: now,
        type,
        title: title.trim() || "Без названия",
        slug: key,
        excerpt: (excerpt || stripHtmlToText(content)).slice(0, 180),
        coverImage,
        html: editorRef.current?.innerHTML || "",
      }
      if (idx >= 0) {
        list[idx] = item
      } else {
        list.unshift(item)
      }
      saveDrafts(list)
      setDrafts(list)
    } catch {
      // ignore
    }
  }

  const save = async (status: "draft" | "published") => {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Введите заголовок и текст", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const payload: any = {
        title: title.trim(),
        excerpt: excerpt.trim() || stripHtmlToText(content).slice(0, 160),
        content: editorRef.current?.innerHTML || "",
        image: coverImage.trim(),
        isActive: status === "published",
      }

      if (type === "blog") {
        payload.category = "general"
        payload.slug = slug || slugify(title)
      } else {
        payload.category = "tourism"
        payload.url = slug || slugify(title)
      }

      const endpoint = type === "blog" ? "/api/blog/posts" : "/api/news"
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Ошибка сохранения")
      }

      if (status === "draft") {
        addToLocalDrafts()
      }

      toast({
        title: status === "published" ? "Опубликовано" : "Черновик сохранен",
        description: type === "blog" ? `Адрес: /blog/${payload.slug}` : `Адрес: /news/${payload.url}`,
      })

      if (status === "published") localStorage.removeItem("write-section-draft")
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const isEmpty = !content || content === "<br>"

  const previewData: PreviewData = useMemo(() => {
    const html = editorRef.current?.innerHTML || ""
    const text = stripHtmlToText(html)
    const words = text.trim().split(/\s+/).filter(Boolean).length
    const readTimeMin = Math.max(1, Math.round(words / 200))
    return {
      type: type === "blog" ? "blog" : "news",
      title: title || "Заголовок статьи",
      excerpt: (excerpt || text || "Краткое описание материала").slice(0, 180),
      coverImage: coverImage,
      authorName: "",
      publishedAt: new Date().toISOString(),
      html: html,
      readTimeMin,
      categoryName: type === "news" ? "Новости" : "Блог",
      views: 532,
    }
  }, [type, title, excerpt, coverImage, content])

  // Cover handlers (Popover)
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Ошибка загрузки обложки")
      }
      const data = await res.json()
      if (data?.imagePath) {
        setCoverImage(data.imagePath)
        toast({ title: "Обложка обновлена" })
      }
    } catch (err: any) {
      toast({ title: "Ошибка загрузки", description: err.message, variant: "destructive" })
    } finally {
      e.target.value = ""
    }
  }

  const applyCoverUrl = () => {
    const url = coverUrlInput.trim()
    if (!url) return
    setCoverImage(url)
    toast({ title: "Обложка обновлена" })
  }

  const clearCover = () => {
    setCoverImage("")
    toast({ title: "Обложка удалена" })
  }

  // Drafts modal handlers
  const loadDraftIntoEditor = (d: DraftItem) => {
    setType(d.type)
    setTitle(d.title)
    setSlug(d.slug)
    setExcerpt(d.excerpt)
    setCoverImage(d.coverImage)
    if (editorRef.current) {
      editorRef.current.innerHTML = d.html
    }
    setContent(d.html)
    setOpenDrafts(false)
    toast({ title: "Черновик загружен" })
  }

  const deleteDraft = (id: string) => {
    const list = drafts.filter((d) => d.id !== id)
    saveDrafts(list)
    setDrafts(list)
  }

  return (
    <div className="write-editor bg-white min-h-[calc(100vh-5rem)] px-6 pt-6 pb-24 rounded-xl shadow-sm">
      {/* Top bar with inline type switcher */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Tabs value={type} onValueChange={(v) => setType(v as ContentType)} className="focus-visible:outline-none">
            <TabsList className="h-8">
              <TabsTrigger
                value="blog"
                className="h-8 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 focus-visible:outline-none focus-visible:ring-0"
              >
                Блог
              </TabsTrigger>
              <TabsTrigger
                value="news"
                className="h-8 data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-900 focus-visible:outline-none focus-visible:ring-0"
              >
                Новости
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Small cover settings popover button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Главная обложка"
                title="Главная обложка"
                className="h-8 w-8"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" className="w-96 bg-white p-4 rounded-md shadow-md">
              <div className="space-y-3">
                <div className="text-sm font-medium">Главная обложка</div>

                {/* Preview */}
                <div className="relative w-full overflow-hidden rounded-md bg-gray-50 border">
                  {coverImage ? (
                    <img
                      src={coverImage || "/placeholder.svg?height=160&width=320&query=cover-image"}
                      alt="Обложка статьи"
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-gray-500">
                      <ImageIcon className="w-5 h-5 mb-2" />
                      <span>{"Обложка не выбрана"}</span>
                    </div>
                  )}
                </div>

                {/* URL input */}
                <div className="flex gap-2">
                  <Input
                    value={coverUrlInput}
                    onChange={(e) => setCoverUrlInput(e.target.value)}
                    placeholder="Вставьте ссылку на изображение"
                    className="h-9"
                  />
                  <Button size="sm" onClick={applyCoverUrl}>
                    Применить
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => coverFileInputRefPopover.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Загрузить
                  </Button>
                  <input
                    ref={coverFileInputRefPopover}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleCoverFileChange}
                  />

                  {coverImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCover}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Удалить
                    </Button>
                  )}
                </div>

                <p className="text-[11px] text-gray-500">
                  Используется в карточках на страницах Новости/Блог и на странице статьи.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Icon-only buttons */}
          <Button
            variant="outline"
            size="icon"
            title="Сохранить черновик"
            aria-label="Сохранить черновик"
            onClick={() => {
              setContent(editorRef.current?.innerHTML || "")
              setTimeout(() => void save("draft"), 0)
            }}
            disabled={isSaving}
            className="h-8 w-8"
          >
            <Save className="w-4 h-4" />
          </Button>

          <Dialog open={openSettings} onOpenChange={setOpenSettings}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                title="Настройки"
                aria-label="Настройки"
                className="h-8 w-8"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white">
              <DialogHeader>
                <DialogTitle>Настройки публикации</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Тип</Label>
                  <Select value={type} onValueChange={(v: ContentType) => setType(v)}>
                    <SelectTrigger className="focus-visible:ring-0 focus-visible:ring-offset-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Блог</SelectItem>
                      <SelectItem value="news">Новости</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Адрес (slug)</Label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="moya-statya"
                    className="focus-visible:ring-0 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500">
                    Итоговый URL: {type === "blog" ? "/blog/" : "/news/"}
                    {slug || "<slug>"}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>Обложка (URL)</Label>
                  <Input
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="focus-visible:ring-0 focus:outline-none"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Краткое описание</Label>
                  <Input
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Короткое описание для превью"
                    className="focus-visible:ring-0 focus:outline-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenSettings(false)} className="focus-visible:ring-0">
                  Готово
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="icon"
            title="Предпросмотр"
            aria-label="Предпросмотр"
            onClick={() => setOpenPreview(true)}
            className="h-8 w-8"
          >
            <EyeIcon className="w-4 h-4" />
          </Button>

          {/* "Open drafts" button near Publish */}
          <Button
            variant="outline"
            onClick={() => setOpenDrafts(true)}
            className="ml-1"
            title="Открыть черновики"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Открыть
          </Button>

          <Button
            onClick={() => {
              setContent(editorRef.current?.innerHTML || "")
              setTimeout(() => void save("published"), 0)
            }}
            disabled={isSaving}
            className="border border-gray-900"
            title="Опубликовать"
          >
            <Send className="w-4 h-4 mr-2" />
            PUBLISH
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="max-w-3xl mx-auto mt-8">
        {/* Title */}
        <GhostInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          inputClassName="text-4xl font-light text-center"
        />

        {/* Short description (excerpt) */}
        <div className="mt-2">
          <GhostInput
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="краткое описание статьи"
            inputClassName="text-gray-500 text-center"
          />
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 text-gray-700">
          {/* Text styles */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Bold"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("bold")}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Italic"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("italic")}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Underline"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("underline")}
          >
            <Underline className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Strikethrough"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("strikeThrough")}
          >
            <Strikethrough className="w-4 h-4" />
          </Button>

          {/* Headings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onMouseDown={(e) => e.preventDefault()}>
              <Button variant="ghost" className="h-8 px-2">
                Заголовок
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={() => formatBlock("P")}>Абзац</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => formatBlock("H1")}>
                <div className="flex items-center gap-2">
                  <Heading1 className="h-4 w-4" />
                  H1
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => formatBlock("H2")}>
                <div className="flex items-center gap-2">
                  <Heading2 className="h-4 w-4" />
                  H2
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => formatBlock("H3")}>
                <div className="flex items-center gap-2">
                  <Heading3 className="h-4 w-4" />
                  H3
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => formatBlock("BLOCKQUOTE")}>
                <div className="flex items-center gap-2">
                  <Quote className="h-4 w-4" />
                  Цитата
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Lists */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Bulleted list"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("insertUnorderedList")}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Numbered list"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("insertOrderedList")}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>

          {/* Font size numeric control */}
          <div className="ml-2 flex items-center gap-2 h-8">
            <Label htmlFor="font-size" className="sr-only">
              Размер шрифта
            </Label>
            <div className="flex items-center">
              <Input
                id="font-size"
                type="number"
                min={8}
                max={128}
                step={1}
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const px = parseInt(fontSize, 10)
                    applyFontSizePx(px)
                  }
                }}
                placeholder="16"
                className="h-8 w-20 text-center focus-visible:ring-0"
              />
              <span className="ml-1 text-sm text-gray-500">px</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const px = parseInt(fontSize, 10)
                applyFontSizePx(px)
              }}
            >
              Применить
            </Button>
          </div>

          {/* Code block */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Код блок"
            onMouseDown={(e) => e.preventDefault()}
            onClick={insertCodeBlock}
            title="КОД"
          >
            <Code2 className="w-4 h-4" />
          </Button>

          {/* Images */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Загрузить изображение"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleImageUploadClick}
            title="Загрузить"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageFileChange} />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Вставить по ссылке"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpenImageUrl(true)}
            title="Изображение по ссылке"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>

          <Dialog open={openImageUrl} onOpenChange={setOpenImageUrl}>
            <DialogContent className="sm:max-w-md bg-white">
              <DialogHeader>
                <DialogTitle>Вставить изображение по ссылке</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2 py-2">
                <Label htmlFor="image-url">URL</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="focus-visible:ring-0"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenImageUrl(false)}>
                  Отмена
                </Button>
                <Button onClick={handleInsertImageByUrl}>Вставить</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Editor */}
        <div className="mt-6 min-h-[50vh] relative">
          {isEmpty && (
            <div className="absolute inset-x-0 top-0 text-center text-gray-400 select-none pointer-events-none transition-opacity duration-300">
              Your story...
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            onInput={(e) => setContent((e.target as HTMLDivElement).innerHTML)}
            className="editor-content outline-none prose max-w-none text-gray-900 focus:outline-none text-center"
            style={{ whiteSpace: "pre-wrap", minHeight: "50vh" }}
            suppressContentEditableWarning
          />
        </div>
      </div>

      {/* Global editor heading centering */}
      <style jsx global>{`
        .write-editor .editor-content h1,
        .write-editor .editor-content h2,
        .write-editor .editor-content h3 {
          text-align: center;
        }
      `}</style>

      {/* Preview Modal - centered with internal scrolling */}
      <Dialog open={openPreview} onOpenChange={setOpenPreview}>
        <DialogContent className="bg-white w-[92vw] sm:w-[85vw] md:w-[80vw] lg:w-[70vw] sm:max-w-5xl max-h-[85vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>Предпросмотр</DialogTitle>
          </DialogHeader>

          <Tabs value={activePreviewTab} onValueChange={(v) => setActivePreviewTab(v as any)} className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="news-card">Новости: карточка</TabsTrigger>
              <TabsTrigger value="news-detail">Новости: страница</TabsTrigger>
              <TabsTrigger value="timeline">Новости: таймлайн</TabsTrigger>
              <TabsTrigger value="blog-card">Блог: карточка</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="news-card" className="m-0">
                <div className="max-w-xl mx-auto">
                  <PreviewNewsCard data={previewData} />
                </div>
              </TabsContent>

              <TabsContent value="news-detail" className="m-0">
                <div className="max-w-3xl mx-auto">
                  <PreviewNewsDetail data={previewData} />
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="m-0">
                <div className="max-w-2xl mx-auto">
                  <PreviewTimelineItem data={previewData} />
                </div>
              </TabsContent>

              <TabsContent value="blog-card" className="m-0">
                <div className="max-w-xl mx-auto">
                  <PreviewBlogCard data={previewData} />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPreview(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drafts Modal */}
      <Dialog open={openDrafts} onOpenChange={setOpenDrafts}>
        <DialogContent className="bg-white w-[92vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>Черновики</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {drafts.length === 0 && (
              <div className="text-sm text-gray-500">Нет сохранённых черновиков</div>
            )}

            {drafts.map((d) => (
              <div
                key={d.id}
                className="flex items-start gap-3 p-3 border rounded-md hover:bg-gray-50"
              >
                <div className="w-24 h-16 overflow-hidden rounded bg-gray-100 shrink-0">
                  {d.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.coverImage || "/placeholder.svg"}
                      alt="cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      no cover
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-1.5 py-0.5 rounded bg-gray-100">{d.type === "news" ? "Новости" : "Блог"}</span>
                    <span>Обновлено: {new Date(d.updatedAt).toLocaleString()}</span>
                  </div>
                  <div className="mt-1 font-medium truncate">{d.title || "Без названия"}</div>
                  <div className="text-sm text-gray-600 line-clamp-2">{d.excerpt}</div>

                  <div className="mt-2 flex items-center gap-2">
                    <Button size="sm" onClick={() => loadDraftIntoEditor(d)}>
                      Загрузить
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteDraft(d.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDrafts(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
