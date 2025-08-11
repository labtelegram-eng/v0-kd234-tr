"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NewsHeroSection() {
  return (
    <section className="relative h-[48vh] min-h-[320px] sm:h-[34vh] sm:min-h-[224px] overflow-hidden">
      {/* Background Image with Blur and Zoom Animation */}
      <div className="absolute inset-0">
        <Image
          src="/news/bangkok-skyline.jpg"
          alt="Bangkok skyline at sunset"
          fill
          className="object-cover blur-sm animate-zoom-in-center"
          priority
          quality={90}
        />
      </div>

      {/* Darkened Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться в главное меню
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">Новости Таиланда</h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto opacity-90">
            Актуальные новости, события и происшествия из Королевства Таиланд
          </p>
        </div>
      </div>
    </section>
  )
}
