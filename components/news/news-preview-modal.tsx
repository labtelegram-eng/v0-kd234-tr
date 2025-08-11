"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Calendar, Clock, Eye, Heart, Share2, User, ExternalLink, ChevronRight } from "lucide-react"
import Link from "next/link"
import { OptimizedImage } from "@/components/image-optimizer"
import { formatDate, formatTime, getCategoryInfo, getTagInfo } from "./news-utils"
import type { NewsPreviewModalProps } from "./news-types"

export function NewsPreviewModal({ isOpen, onClose, newsItem, relatedNews }: NewsPreviewModalProps) {
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!newsItem) return null

  const categoryInfo = getCategoryInfo(newsItem.category)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: newsItem.title,
          text: newsItem.excerpt,
          url: `${window.location.origin}/news/${newsItem.id}`,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/news/${newsItem.id}`)
      alert("Ссылка скопирована в буфер обмена!")
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-white">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-gray-900 line-clamp-1">Предпросмотр новости</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Hero Image */}
              <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden mb-6">
                <OptimizedImage
                  src={newsItem.image || "/placeholder.svg"}
                  alt={newsItem.title}
                  maxWidth={800}
                  maxHeight={400}
                  quality={0.9}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <Badge className={`${categoryInfo.color} border-0 shadow-lg backdrop-blur-sm`}>
                    {categoryInfo.name}
                  </Badge>
                  {newsItem.isFeatured && (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg backdrop-blur-sm">
                      🔥 Главная
                    </Badge>
                  )}
                </div>

                {/* Tags */}
                {newsItem.tags && newsItem.tags.length > 0 && (
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                    {newsItem.tags.slice(0, 3).map((tagId) => {
                      const tagInfo = getTagInfo(tagId)
                      return (
                        <Badge key={tagId} className={`${tagInfo.color} border-0 text-xs shadow-lg backdrop-blur-sm`}>
                          #{tagInfo.name}
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Article Info */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">{newsItem.title}</h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(newsItem.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(newsItem.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{newsItem.viewCount || 0} просмотров</span>
                  </div>
                </div>

                {/* Author */}
                {newsItem.author && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={newsItem.author.avatar || "/placeholder.svg"} alt={newsItem.author.name} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{newsItem.author.name}</div>
                      <div className="text-sm text-gray-600">{newsItem.author.role}</div>
                      {newsItem.author.bio && <div className="text-xs text-gray-500 mt-1">{newsItem.author.bio}</div>}
                    </div>
                  </div>
                )}

                {/* Excerpt */}
                <div className="text-lg text-gray-700 font-medium mb-6 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                  {newsItem.excerpt}
                </div>

                {/* Content Preview */}
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-700 leading-relaxed">
                    {newsItem.content
                      .split("\n\n")
                      .slice(0, 3)
                      .map((paragraph, index) => (
                        <p key={index} className="mb-4">
                          {paragraph}
                        </p>
                      ))}
                    {newsItem.content.split("\n\n").length > 3 && (
                      <div className="text-center py-4">
                        <div className="text-gray-500 text-sm mb-4">
                          ... и еще {newsItem.content.split("\n\n").length - 3} абзацев
                        </div>
                        <Link href={`/news/${newsItem.id}`}>
                          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Читать полностью
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Related News */}
              {relatedNews.length > 0 && (
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    Похожие новости
                    <ChevronRight className="h-5 w-5 ml-2 text-gray-400" />
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedNews.slice(0, 3).map((relatedItem) => {
                      const relatedCategoryInfo = getCategoryInfo(relatedItem.category)
                      return (
                        <Link key={relatedItem.id} href={`/news/${relatedItem.id}`} onClick={onClose}>
                          <Card className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg h-full">
                            <div className="relative h-32 overflow-hidden">
                              <OptimizedImage
                                src={relatedItem.image || "/placeholder.svg"}
                                alt={relatedItem.title}
                                maxWidth={200}
                                maxHeight={120}
                                quality={0.8}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <Badge className={`absolute top-2 left-2 ${relatedCategoryInfo.color} border-0 text-xs`}>
                                {relatedCategoryInfo.name}
                              </Badge>
                            </div>
                            <CardContent className="p-3">
                              <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {relatedItem.title}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{relatedItem.excerpt}</p>
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-2 transition-all duration-200 ${
                    isLiked ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" : "hover:bg-gray-100"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                  <span>{(newsItem.likeCount || 0) + (isLiked ? 1 : 0)}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2 hover:bg-gray-100 bg-transparent"
                >
                  <Share2 className="h-4 w-4" />
                  Поделиться
                </Button>
              </div>
              <Link href={`/news/${newsItem.id}`}>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Открыть статью
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
