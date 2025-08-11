"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"

interface VideoPlayerProps {
  videoPlayer: {
    isOpen: boolean
    currentVideo: any
    position: { x: number; y: number }
    isDragging: boolean
    dragOffset: { x: number; y: number }
  }
  onClose: () => void
  onUpdate: (updater: (prev: any) => any) => void
}

export function VideoPlayer({ videoPlayer, onClose, onUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Видео данные
  const videoPlaylist = [
    {
      id: 1,
      name: "Традиционная тайская музыка",
      thumbnail: "/placeholder.svg?height=300&width=400&text=Traditional+Thai+Music+Cover",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
    {
      id: 2,
      name: "Современная тайская поп-музыка",
      thumbnail: "/placeholder.svg?height=300&width=400&text=Modern+Thai+Pop+Cover",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    },
    {
      id: 3,
      name: "Тайские народные песни",
      thumbnail: "/placeholder.svg?height=300&width=400&text=Thai+Folk+Songs+Cover",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
  ]

  const playNextVideo = () => {
    if (!videoPlayer) return
    const currentIndex = videoPlaylist.findIndex((video) => video.id === videoPlayer.currentVideo.id)
    const nextIndex = (currentIndex + 1) % videoPlaylist.length
    const nextVideo = videoPlaylist[nextIndex]

    onUpdate((prev: any) =>
      prev
        ? {
            ...prev,
            currentVideo: nextVideo,
          }
        : null,
    )
  }

  const playPreviousVideo = () => {
    if (!videoPlayer) return
    const currentIndex = videoPlaylist.findIndex((video) => video.id === videoPlayer.currentVideo.id)
    const prevIndex = currentIndex === 0 ? videoPlaylist.length - 1 : currentIndex - 1
    const prevVideo = videoPlaylist[prevIndex]

    onUpdate((prev: any) =>
      prev
        ? {
            ...prev,
            currentVideo: prevVideo,
          }
        : null,
    )
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!videoPlayer) return
    onUpdate((prev: any) =>
      prev
        ? {
            ...prev,
            isDragging: true,
            dragOffset: {
              x: e.clientX - videoPlayer.position.x,
              y: e.clientY - videoPlayer.position.y,
            },
          }
        : null,
    )
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!videoPlayer?.isDragging) return
    onUpdate((prev: any) =>
      prev
        ? {
            ...prev,
            position: {
              x: Math.max(0, Math.min(window.innerWidth - 600, e.clientX - prev.dragOffset.x)),
              y: Math.max(0, Math.min(window.innerHeight - 400, e.clientY - prev.dragOffset.y)),
            },
          }
        : null,
    )
  }

  const handleMouseUp = () => {
    if (!videoPlayer) return
    onUpdate((prev: any) => (prev ? { ...prev, isDragging: false } : null))
  }

  // useEffect для обработки перетаскивания
  useEffect(() => {
    if (videoPlayer?.isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [videoPlayer?.isDragging])

  // Автозапуск видео при открытии плеера
  useEffect(() => {
    if (videoPlayer?.isOpen && videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("Autoplay prevented:", error)
      })
    }
  }, [videoPlayer?.currentVideo])

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    onClose()
  }

  if (!videoPlayer?.isOpen) return null

  return (
    <div
      className="fixed z-[100] bg-black rounded-2xl shadow-2xl border border-gray-800 w-[600px] select-none"
      style={{
        left: videoPlayer.position.x,
        top: videoPlayer.position.y,
        cursor: videoPlayer.isDragging ? "grabbing" : "grab",
      }}
    >
      {/* Header - Draggable */}
      <div
        className="flex items-center justify-between p-3 bg-black/90 rounded-t-2xl cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Video Content */}
      <div className="relative bg-black rounded-b-2xl overflow-hidden">
        {/* Video Player */}
        <div className="relative" style={{ aspectRatio: "16/9" }}>
          <video
            ref={videoRef}
            src={videoPlayer.currentVideo.videoUrl}
            className="w-full h-full"
            controls
            autoPlay
            preload="metadata"
            onError={(e) => {
              console.error("Video error:", e)
            }}
          />
        </div>

        {/* Simple Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2">
          <button
            onClick={playPreviousVideo}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            title="Предыдущее видео"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={playNextVideo}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            title="Следующее видео"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
