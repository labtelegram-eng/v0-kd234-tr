"use client"

import { ExternalLink, Phone, MapPin, Info } from "lucide-react"

export function QuickLinksWidget() {
  const quickLinks = [
    {
      icon: Phone,
      label: "Экстренные службы",
      value: "191",
      color: "text-red-600",
      bgColor: "from-red-50 to-pink-100",
      borderColor: "border-red-200",
    },
    {
      icon: MapPin,
      label: "Посольство РФ",
      value: "+66 2 234 2012",
      color: "text-blue-600",
      bgColor: "from-blue-50 to-cyan-100",
      borderColor: "border-blue-200",
    },
    {
      icon: Info,
      label: "Туристическая помощь",
      value: "1672",
      color: "text-purple-600",
      bgColor: "from-purple-50 to-violet-100",
      borderColor: "border-purple-200",
    },
  ]

  return (
    <>
      {quickLinks.map((link, index) => {
        const IconComponent = link.icon
        return (
          <div
            key={index}
            className={`bg-gradient-to-br ${link.bgColor} rounded-xl p-4 border ${link.borderColor} hover:shadow-md transition-all duration-200 cursor-pointer`}
          >
            <div className="flex items-center gap-2 mb-2">
              <IconComponent className={`w-4 h-4 ${link.color}`} />
              <span className={`text-xs font-medium ${link.color.replace("text-", "text-").replace("-600", "-800")}`}>
                {link.label}
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-gray-900">{link.value}</div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <ExternalLink className="w-3 h-3" />
                <span>Нажмите для звонка</span>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
