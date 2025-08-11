"use client"

export function SiteFooter() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 lg:space-x-8 text-center sm:text-left">
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">
              О нас
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">
              Контакты
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">
              Политика конфиденциальности
            </a>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
            © 2023 Путеводитель по Таиланду. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  )
}
