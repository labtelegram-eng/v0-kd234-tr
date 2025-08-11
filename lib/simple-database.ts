// Простая база данных в localStorage для демонстрации
// В будущем легко заменить на SQL

interface User {
  id: number
  username: string
  password: string // В реальном проекте должен быть захеширован
  securityQuestion: string
  securityAnswer: string
  createdAt: string
  role?: "user" | "admin" // Добавляем роли
}

interface Session {
  id: string
  userId: number
  expiresAt: string
}

interface Destination {
  id: number
  name: string
  image: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Обновить интерфейс для слайдов и настроек главной страницы
interface HeroSlide {
  id: number
  image: string
  alt: string
  order: number
  isActive: boolean
}

interface HomePageSettings {
  id: number
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  slides: HeroSlide[]
  updatedAt: string
}

// Интерфейсы для блога
interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  image: string
  category: string
  slug: string
  publishedAt: string
  readTime: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  isActive: boolean
  order: number
}

// Интерфейсы для новостей
interface NewsItem {
  id: number
  title: string
  excerpt: string
  content: string
  image: string
  publishedAt: string
  isActive: boolean
  isFeatured: boolean // для главной новости
  category: string // добавляем категорию
  createdAt: string
  updatedAt: string
}

// Интерфейс для виджетов
interface NewsWidget {
  id: number
  type: "time" | "safety" | "emergency" | "embassy" | "tourist-help" | "custom"
  title: string
  isActive: boolean
  order: number
  settings: {
    icon?: string
    color?: string
    bgColor?: string
    content?: string
    phone?: string
    description?: string
    timezone?: string
    format?: string
    status?: "safe" | "medium" | "danger" // Обновляем статусы безопасности
    level?: string
    reason?: string // Причина для статусов medium и danger
    relatedNewsId?: number // ID связанной новости
    contacts?: Array<{ name: string; phone: string }>
  }
  createdAt: string
  updatedAt: string
}

// ОБНОВЛЕННЫЙ интерфейс для партнерских уведомлений с контролем показов
interface PartnerNotification {
  id: number
  title: string
  content: string
  ctaText: string
  ctaUrl: string
  isActive: boolean
  showAfterSeconds: number
  showOnPages: {
    home: boolean
    blog: boolean
    news: boolean
    destinations: boolean
  }
  // Новые поля для контроля показов
  limitShows: boolean // включить ограничение показов
  maxShowsPerSession: number // максимальное количество показов за сессию
  showRandomly: boolean // показывать случайно или всегда (если не превышен лимит)
  targetScope?: 'pages' | 'specific'
  targetedNewsIds?: number[]
  targetedBlogIds?: number[]
  createdAt: string
  updatedAt: string
}

// Интерфейс для отслеживания показов уведомлений
interface NotificationView {
  sessionId: string
  notificationId: number
  viewCount: number
  lastViewAt: string
}

// Интерфейсы для музыки
interface MusicTrack {
  id: number
  name: string
  artist: string
  coverImage: string
  youtubeUrl: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Интерфейс для культурного видео
interface CultureVideo {
  id: number
  title: string
  description: string
  youtubeUrl: string
  thumbnail: string
  isActive: boolean
  updatedAt: string
}

const USERS_KEY = "thailand_users"
const SESSIONS_KEY = "thailand_sessions"
const CURRENT_SESSION_KEY = "thailand_current_session"
const DESTINATIONS_KEY = "thailand_destinations"
const HOME_SETTINGS_KEY = "thailand_home_settings"
const BLOG_POSTS_KEY = "thailand_blog_posts"
const BLOG_CATEGORIES_KEY = "thailand_blog_categories"
const NEWS_KEY = "thailand_news"
const NEWS_WIDGETS_KEY = "thailand_news_widgets"
const PARTNER_NOTIFICATIONS_KEY = "thailand_partner_notifications"
const NOTIFICATION_VIEWS_KEY = "thailand_notification_views"
const MUSIC_TRACKS_KEY = "thailand_music_tracks"
const CULTURE_VIDEO_KEY = "thailand_culture_video"

// Функции для работы с просмотрами уведомлений
function getNotificationViews(): NotificationView[] {
  if (typeof window === "undefined") return []
  const views = localStorage.getItem(NOTIFICATION_VIEWS_KEY)
  return views ? JSON.parse(views) : []
}

function saveNotificationViews(views: NotificationView[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(NOTIFICATION_VIEWS_KEY, JSON.stringify(views))
}

// Получить или создать ID сессии для отслеживания показов
function getOrCreateViewSessionId(): string {
  if (typeof window === "undefined") return "server-session"
  
  const sessionKey = "thailand_view_session"
  let sessionId = localStorage.getItem(sessionKey)
  
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem(sessionKey, sessionId)
  }
  
  return sessionId
}

// Записать просмотр уведомления
function recordNotificationView(notificationId: number): void {
  const sessionId = getOrCreateViewSessionId()
  const views = getNotificationViews()
  
  const existingView = views.find(v => v.sessionId === sessionId && v.notificationId === notificationId)
  
  if (existingView) {
    existingView.viewCount++
    existingView.lastViewAt = new Date().toISOString()
  } else {
    views.push({
      sessionId,
      notificationId,
      viewCount: 1,
      lastViewAt: new Date().toISOString()
    })
  }
  
  saveNotificationViews(views)
}

// Проверить, можно ли показать уведомление
function canShowNotification(notification: PartnerNotification): boolean {
  if (!notification.limitShows) {
    return true // Если ограничения отключены, всегда показываем
  }
  
  const sessionId = getOrCreateViewSessionId()
  const views = getNotificationViews()
  
  const view = views.find(v => v.sessionId === sessionId && v.notificationId === notification.id)
  
  if (!view) {
    return true // Еще не показывали
  }
  
  if (view.viewCount >= notification.maxShowsPerSession) {
    return false // Превышен лимит показов
  }
  
  if (notification.showRandomly) {
    // Случайный показ: чем больше уже показали, тем меньше вероятность
    const probability = 1 - (view.viewCount / notification.maxShowsPerSession)
    return Math.random() < probability
  }
  
  return true // Показываем, если не превышен лимит
}

// ОБНОВЛЕННЫЕ функции для партнерских уведомлений
function getPartnerNotifications(): PartnerNotification[] {
  if (typeof window === "undefined") return []

  const notifications = localStorage.getItem(PARTNER_NOTIFICATIONS_KEY)
  return notifications ? JSON.parse(notifications) : []
}

function savePartnerNotifications(notifications: PartnerNotification[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PARTNER_NOTIFICATIONS_KEY, JSON.stringify(notifications))
}

// Получить все уведомления
export function getAllPartnerNotifications(): PartnerNotification[] {
  return getPartnerNotifications().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Получить активные уведомления
export function getActivePartnerNotifications(): PartnerNotification[] {
  return getPartnerNotifications().filter(n => n.isActive)
}

// Получить уведомление по ID
export function getPartnerNotificationById(id: number): PartnerNotification | null {
  return getPartnerNotifications().find(n => n.id === id) || null
}

// Создать новое уведомление
export function createPartnerNotification(data: {
  title: string
  content: string
  ctaText: string
  ctaUrl: string
  showAfterSeconds: number
  showOnPages: {
    home: boolean
    blog: boolean
    news: boolean
    destinations: boolean
  }
  limitShows?: boolean
  maxShowsPerSession?: number
  showRandomly?: boolean
  targetScope?: 'pages' | 'specific'
  targetedNewsIds?: number[]
  targetedBlogIds?: number[]
}): { success: boolean; error?: string; notification?: PartnerNotification } {
  try {
    const notifications = getPartnerNotifications()
    
    const newNotification: PartnerNotification = {
      id: Math.max(0, ...notifications.map(n => n.id)) + 1,
      title: data.title,
      content: data.content,
      ctaText: data.ctaText,
      ctaUrl: data.ctaUrl,
      isActive: true,
      showAfterSeconds: data.showAfterSeconds,
      showOnPages: data.showOnPages,
      limitShows: data.limitShows || false,
      maxShowsPerSession: data.maxShowsPerSession || 1,
      showRandomly: data.showRandomly || false,
      targetScope: data.targetScope ?? 'pages',
      targetedNewsIds: data.targetedNewsIds ?? [],
      targetedBlogIds: data.targetedBlogIds ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    notifications.push(newNotification)
    savePartnerNotifications(notifications)

    return { success: true, notification: newNotification }
  } catch (error) {
    return { success: false, error: "Ошибка при создании уведомления" }
  }
}

// Обновить уведомление
export function updatePartnerNotification(id: number, data: {
  title?: string
  content?: string
  ctaText?: string
  ctaUrl?: string
  isActive?: boolean
  showAfterSeconds?: number
  showOnPages?: {
    home?: boolean
    blog?: boolean
    news?: boolean
    destinations?: boolean
  }
  limitShows?: boolean
  maxShowsPerSession?: number
  showRandomly?: boolean
  targetScope?: 'pages' | 'specific'
  targetedNewsIds?: number[]
  targetedBlogIds?: number[]
}): { success: boolean; error?: string; notification?: PartnerNotification } {
  try {
    const notifications = getPartnerNotifications()
    const index = notifications.findIndex(n => n.id === id)

    if (index === -1) {
      return { success: false, error: "Уведомление не найдено" }
    }

    notifications[index] = {
      ...notifications[index],
      ...data,
      showOnPages: {
        ...notifications[index].showOnPages,
        ...(data.showOnPages || {})
      },
      // Ensure arrays are updated only if provided
      targetedNewsIds: data.targetedNewsIds !== undefined ? data.targetedNewsIds : (notifications[index].targetedNewsIds ?? []),
      targetedBlogIds: data.targetedBlogIds !== undefined ? data.targetedBlogIds : (notifications[index].targetedBlogIds ?? []),
      updatedAt: new Date().toISOString(),
    }

    savePartnerNotifications(notifications)
    return { success: true, notification: notifications[index] }
  } catch (error) {
    return { success: false, error: "Ошибка при обновлении уведомления" }
  }
}

// Удалить уведомление
export function deletePartnerNotification(id: number): { success: boolean; error?: string } {
  try {
    const notifications = getPartnerNotifications()
    const filteredNotifications = notifications.filter(n => n.id !== id)

    if (notifications.length === filteredNotifications.length) {
      return { success: false, error: "Уведомление не найдено" }
    }

    savePartnerNotifications(filteredNotifications)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Ошибка при удалении уведомления" }
  }
}

// ОБНОВЛЕННАЯ функция для получения случайного уведомления для конкретной страницы с учетом ограничений
export function getRandomPartnerNotificationForPage(page: 'home' | 'blog' | 'news' | 'destinations'): PartnerNotification | null {
  const activeNotifications = getActivePartnerNotifications()
  const suitableNotifications = activeNotifications.filter(n => 
    n.showOnPages[page] && canShowNotification(n)
  )

  if (suitableNotifications.length === 0) {
    return null
  }

  // Возвращаем случайное уведомление из подходящих
  const randomIndex = Math.floor(Math.random() * suitableNotifications.length)
  const selectedNotification = suitableNotifications[randomIndex]
  
  // Записываем просмотр
  recordNotificationView(selectedNotification.id)
  
  return selectedNotification
}

// ОБРАТНАЯ СОВМЕСТИМОСТЬ - для старого API
export function getPartnerNotification(): PartnerNotification | null {
  const notifications = getActivePartnerNotifications()
  return notifications.length > 0 ? notifications[0] : null
}

// Функция для сброса статистики просмотров (для админки)
export function resetNotificationViews(notificationId?: number): { success: boolean; error?: string } {
  try {
    if (notificationId) {
      // Сбросить для конкретного уведомления
      const views = getNotificationViews()
      const filteredViews = views.filter(v => v.notificationId !== notificationId)
      saveNotificationViews(filteredViews)
    } else {
      // Сбросить все
      saveNotificationViews([])
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: "Ошибка при сбросе статистики" }
  }
}

// Получить статистику просмотров
export function getNotificationViewStats(notificationId?: number): { 
  totalViews: number; 
  uniqueSessions: number; 
  viewsByNotification: Array<{ notificationId: number; views: number; sessions: number }> 
} {
  const views = getNotificationViews()
  
  if (notificationId) {
    const notificationViews = views.filter(v => v.notificationId === notificationId)
    return {
      totalViews: notificationViews.reduce((sum, v) => sum + v.viewCount, 0),
      uniqueSessions: notificationViews.length,
      viewsByNotification: [{
        notificationId,
        views: notificationViews.reduce((sum, v) => sum + v.viewCount, 0),
        sessions: notificationViews.length
      }]
    }
  }
  
  // Статистика по всем уведомлениям
  const statsByNotification = new Map<number, { views: number; sessions: number }>()
  
  views.forEach(view => {
    const existing = statsByNotification.get(view.notificationId) || { views: 0, sessions: 0 }
    existing.views += view.viewCount
    existing.sessions += 1
    statsByNotification.set(view.notificationId, existing)
  })
  
  return {
    totalViews: views.reduce((sum, v) => sum + v.viewCount, 0),
    uniqueSessions: views.length,
    viewsByNotification: Array.from(statsByNotification.entries()).map(([id, stats]) => ({
      notificationId: id,
      views: stats.views,
      sessions: stats.sessions
    }))
  }
}

// Инициализация с тестовыми данными
function initDatabase() {
  if (typeof window === "undefined") return

  const existingUsers = localStorage.getItem(USERS_KEY)
  if (!existingUsers) {
    const testUsers: User[] = [
      {
        id: 1,
        username: "testuser",
        password: "test123",
        securityQuestion: "Как звали вашего первого питомца?",
        securityAnswer: "мурзик",
        createdAt: new Date().toISOString(),
        role: "user",
      },
      {
        id: 2,
        username: "admin",
        password: "admin123",
        securityQuestion: "Как звали вашего первого питомца?",
        securityAnswer: "админ",
        createdAt: new Date().toISOString(),
        role: "admin",
      },
    ]
    localStorage.setItem(USERS_KEY, JSON.stringify(testUsers))
  }

  const existingSessions = localStorage.getItem(SESSIONS_KEY)
  if (!existingSessions) {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify([]))
  }

  // Инициализация направлений с новыми изображениями
  const existingDestinations = localStorage.getItem(DESTINATIONS_KEY)
  if (!existingDestinations) {
    const defaultDestinations: Destination[] = [
      {
        id: 1,
        name: "Пхукет",
        image: "/destinations/new-phuket.webp",
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Бангкок",
        image: "/destinations/new-bangkok.webp",
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        name: "Чиангмай",
        image: "/destinations/new-chiang-mai.webp",
        order: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 4,
        name: "Краби",
        image: "/destinations/new-krabi.webp",
        order: 4,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 5,
        name: "Паттайя",
        image: "/destinations/new-pattaya.webp",
        order: 5,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 6,
        name: "Ко Самуи",
        image: "/destinations/new-koh-samui.webp",
        order: 6,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(DESTINATIONS_KEY, JSON.stringify(defaultDestinations))
  } else {
    // Обновляем существующие направления с новыми изображениями
    const destinations: Destination[] = JSON.parse(existingDestinations)
    const imageMap: { [key: string]: string } = {
      "Пхукет": "/destinations/new-phuket.webp",
      "Бангкок": "/destinations/new-bangkok.webp", 
      "Чиангмай": "/destinations/new-chiang-mai.webp",
      "Краби": "/destinations/new-krabi.webp",
      "Паттайя": "/destinations/new-pattaya.webp",
      "Ко Самуи": "/destinations/new-koh-samui.webp"
    }
    
    destinations.forEach(destination => {
      if (imageMap[destination.name]) {
        destination.image = imageMap[destination.name]
        destination.updatedAt = new Date().toISOString()
      }
    })
    
    localStorage.setItem(DESTINATIONS_KEY, JSON.stringify(destinations))
  }

  // ОБНОВЛЕННАЯ инициализация настроек главной страницы с новыми слайдами
  const existingHomeSettings = localStorage.getItem(HOME_SETTINGS_KEY)
  // Принудительно обновляем слайды даже если настройки уже существуют
  const defaultHomeSettings: HomePageSettings = {
    id: 1,
    heroTitle: "Откройте для себя чудеса Таиланда",
    heroSubtitle:
      "Откройте для себя красоту, культуру и приключения, которые ждут вас в Стране Улыбок. Спланируйте свое идеальное путешествие с нашим подробным гидом.",
    heroButtonText: "Начать планирование",
    slides: [
      {
        id: 1,
        image: "/hero/thailand-rural-countryside.webp",
        alt: "Сельская местность Таиланда с рисовыми полями и традиционными домами",
        order: 1,
        isActive: true,
      },
      {
        id: 2,
        image: "/hero/luxury-resort-courtyard.webp",
        alt: "Роскошный курортный дворик с пальмами и восточной архитектурой",
        order: 2,
        isActive: true,
      },
      {
        id: 3,
        image: "/hero/tropical-islands-aerial.webp",
        alt: "Аэрофотосъемка тропических островов с бирюзовой водой",
        order: 3,
        isActive: true,
      },
      {
        id: 4,
        image: "/hero/thailand-flag-mountain-view.webp",
        alt: "Человек с флагом Таиланда на горной вершине",
        order: 4,
        isActive: true,
      },
    ],
    updatedAt: new Date().toISOString(),
  }

  if (existingHomeSettings) {
    // Если настройки существуют, сохраняем текст, но обновляем слайды
    const currentSettings: HomePageSettings = JSON.parse(existingHomeSettings)
    defaultHomeSettings.heroTitle = currentSettings.heroTitle
    defaultHomeSettings.heroSubtitle = currentSettings.heroSubtitle
    defaultHomeSettings.heroButtonText = currentSettings.heroButtonText
  }

  localStorage.setItem(HOME_SETTINGS_KEY, JSON.stringify(defaultHomeSettings))

  // В конце функции initDatabase() добавить:
  initMusicAndVideoData()
  initBlogData()
  // Инициализация новостей
  initNewsData()
  // Инициализация виджетов
  initNewsWidgets()
  // ОБНОВЛЕННАЯ инициализация партнерских уведомлений
  initPartnerNotificationData()
}

// Получение всех пользователей
function getUsers(): User[] {
  if (typeof window === "undefined") return []
  const users = localStorage.getItem(USERS_KEY)
  return users ? JSON.parse(users) : []
}

// Сохранение пользователей
function saveUsers(users: User[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Получение всех сессий
function getSessions(): Session[] {
  if (typeof window === "undefined") return []
  const sessions = localStorage.getItem(SESSIONS_KEY)
  return sessions ? JSON.parse(sessions) : []
}

// Сохранение сессий
function saveSessions(sessions: Session[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

// Получение направлений
function getDestinations(): Destination[] {
  if (typeof window === "undefined") return []
  const destinations = localStorage.getItem(DESTINATIONS_KEY)
  return destinations ? JSON.parse(destinations) : []
}

// Сохранение направлений
function saveDestinations(destinations: Destination[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(DESTINATIONS_KEY, JSON.stringify(destinations))
}

// Создание пользователя
export function createUser(userData: {
  username: string
  password: string
  securityQuestion: string
  securityAnswer: string
}): { success: boolean; error?: string; user?: Omit<User, "password"> } {
  try {
    const users = getUsers()

    // Проверяем, существует ли пользователь
    const existingUser = users.find((u) => u.username.toLowerCase() === userData.username.toLowerCase())
    if (existingUser) {
      return { success: false, error: "Пользователь с таким логином уже существует" }
    }

    // Создаем нового пользователя
    const newUser: User = {
      id: Math.max(0, ...users.map((u) => u.id)) + 1,
      username: userData.username,
      password: userData.password,
      securityQuestion: userData.securityQuestion,
      securityAnswer: userData.securityAnswer.toLowerCase().trim(),
      createdAt: new Date().toISOString(),
      role: "user",
    }

    users.push(newUser)
    saveUsers(users)

    const { password, ...userWithoutPassword } = newUser
    return { success: true, user: userWithoutPassword }
  } catch (error) {
    return { success: false, error: "Ошибка при создании пользователя" }
  }
}

// Получение пользователя по логину
export function getUserByUsername(username: string): User | null {
  const users = getUsers()
  const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null

  // Автоматически назначаем роль админа для пользователя "admin"
  if (user && user.username.toLowerCase() === "admin" && user.role !== "admin") {
    user.role = "admin"
    // Обновляем в базе данных
    const userIndex = users.findIndex((u) => u.id === user!.id)
    if (userIndex !== -1) {
      users[userIndex].role = "admin"
      saveUsers(users)
    }
  }

  return user
}

// Проверка пароля
export function verifyPassword(password: string, userPassword: string): boolean {
  return password === userPassword
}

// Проверка ответа на секретный вопрос
export function verifySecurityAnswer(answer: string, userAnswer: string): boolean {
  return answer.toLowerCase().trim() === userAnswer.toLowerCase().trim()
}

// Обновление пароля
export function updatePassword(username: string, newPassword: string): boolean {
  try {
    const users = getUsers()
    const userIndex = users.findIndex((u) => u.username.toLowerCase() === username.toLowerCase())

    if (userIndex === -1) return false

    users[userIndex].password = newPassword
    saveUsers(users)
    return true
  } catch (error) {
    return false
  }
}

// Создание сессии
export function createSession(userId: number): string {
  try {
    const sessions = getSessions()
    const sessionId = generateSessionId()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 дней

    const newSession: Session = {
      id: sessionId,
      userId,
      expiresAt: expiresAt.toISOString(),
    }

    sessions.push(newSession)
    saveSessions(sessions)

    // Сохраняем текущую сессию
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId)
    }

    return sessionId
  } catch (error) {
    throw error
  }
}

// Получение текущего пользователя
export function getCurrentUser(): Omit<User, "password"> | null {
  try {
    if (typeof window === "undefined") return null

    const currentSessionId = localStorage.getItem(CURRENT_SESSION_KEY)
    if (!currentSessionId) return null

    const sessions = getSessions()
    const session = sessions.find((s) => s.id === currentSessionId)

    if (!session) return null

    // Проверяем, не истекла ли сессия
    if (new Date(session.expiresAt) <= new Date()) {
      deleteSession(currentSessionId)
      return null
    }

    const users = getUsers()
    const user = users.find((u) => u.id === session.userId)
    if (!user) return null

    // Автоматически назначаем роль админа для пользователя "admin"
    if (user.username.toLowerCase() === "admin" && user.role !== "admin") {
      user.role = "admin"
      // Обновляем в базе данных
      const userIndex = users.findIndex((u) => u.id === user!.id)
      if (userIndex !== -1) {
        users[userIndex].role = "admin"
        saveUsers(users)
      }
    }

    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    return null
  }
}

// Удаление сессии
export function deleteSession(sessionId: string): boolean {
  try {
    const sessions = getSessions()
    const filteredSessions = sessions.filter((s) => s.id !== sessionId)
    saveSessions(filteredSessions)

    // Удаляем текущую сессию если это она
    if (typeof window !== "undefined") {
      const currentSessionId = localStorage.getItem(CURRENT_SESSION_KEY)
      if (currentSessionId === sessionId) {
        localStorage.removeItem(CURRENT_SESSION_KEY)
      }
    }

    return true
  } catch (error) {
    return false
  }
}

// Выход из системы
export function logout(): void {
  try {
    if (typeof window !== "undefined") {
      const currentSessionId = localStorage.getItem(CURRENT_SESSION_KEY)
      if (currentSessionId) {
        deleteSession(currentSessionId)
      }
      localStorage.removeItem(CURRENT_SESSION_KEY)
    }
  } catch (error) {
    // Silent error
  }
}

// CRUD операции для направлений
export function getAllDestinations(): Destination[] {
  return getDestinations().sort((a, b) => a.order - b.order)
}

export function getActiveDestinations(): Destination[] {
  return getDestinations()
    .filter((d) => d.isActive)
    .sort((a, b) => a.order - b.order)
}

export function createDestination(data: {
  name: string
  image: string
  order?: number
}): { success: boolean; error?: string; destination?: Destination } {
  try {
    const destinations = getDestinations()
    const maxOrder = Math.max(0, ...destinations.map((d) => d.order))

    const newDestination: Destination = {
      id: Math.max(0, ...destinations.map((d) => d.id)) + 1,
      name: data.name,
      image: data.image,
      order: data.order || maxOrder + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    destinations.push(newDestination)
    saveDestinations(destinations)

    return { success: true, destination: newDestination }
  } catch (error) {
    return { success: false, error: "Ошибка при создании направления" }
  }
}

export function updateDestination(
  id: number,
  data: Partial<Pick<Destination, "name" | "image" | "order" | "isActive">>,
): { success: boolean; error?: string; destination?: Destination } {
  try {
    const destinations = getDestinations()
    const index = destinations.findIndex((d) => d.id === id)

    if (index === -1) {
      return { success: false, error: "Направление не найдено" }
    }

    destinations[index] = {
      ...destinations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    saveDestinations(destinations)
    return { success: true, destination: destinations[index] }
  } catch (error) {
    return { success: false, error: "Ошибка при обновлении направления" }
  }
}

export function deleteDestination(id: number): { success: boolean; error?: string } {
  try {
    const destinations = getDestinations()
    const filteredDestinations = destinations.filter((d) => d.id !== id)

    if (destinations.length === filteredDestinations.length) {
      return { success: false, error: "Направление не найдено" }
    }

    saveDestinations(filteredDestinations)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Ошибка при удалении направления" }
  }
}

// Генерация ID сессии
function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Обновить функции для работы с настройками главной страницы
function getHomeSettings(): HomePageSettings {
  if (typeof window === "undefined") {
    return {
      id: 1,
      heroTitle: "Откройте для себя чудеса Таиланда",
      heroSubtitle:
        "Откройте для себя красоту, культуру и приключения, которые ждут вас в Стране Улыбок. Спланируйте свое идеальное путешествие с нашим подробным гидом.",
      heroButtonText: "Начать планирование",
      slides: [
        {
          id: 1,
          image: "/hero/thailand-rural-countryside.webp",
          alt: "Сельская местность Таиланда с рисовыми полями и традиционными домами",
          order: 1,
          isActive: true,
        },
        {
          id: 2,
          image: "/hero/luxury-resort-courtyard.webp",
          alt: "Роскошный курортный дворик с пальмами и восточной архитектурой",
          order: 2,
          isActive: true,
        },
        {
          id: 3,
          image: "/hero/tropical-islands-aerial.webp",
          alt: "Аэрофотосъемка тропических островов с бирюзовой водой",
          order: 3,
          isActive: true,
        },
        {
          id: 4,
          image: "/hero/thailand-flag-mountain-view.webp",
          alt: "Человек с флагом Таиланда на горной вершине",
          order: 4,
          isActive: true,
        },
      ],
      updatedAt: new Date().toISOString(),
    }
  }
  const settings = localStorage.getItem(HOME_SETTINGS_KEY)
  return settings
    ? JSON.parse(settings)
    : {
        id: 1,
        heroTitle: "Откройте для себя чудеса Таиланда",
        heroSubtitle:
          "Откройте для себя красоту, культуру и приключения, которые ждут вас в Стране Улыбок. Спланируйте свое идеальное путешествие с нашим подробным гидом.",
        heroButtonText: "Начать планирование",
        slides: [
          {
            id: 1,
            image: "/hero/thailand-rural-countryside.webp",
            alt: "Сельская местность Таиланда с рисовыми полями и традиционными домами",
            order: 1,
            isActive: true,
          },
          {
            id: 2,
            image: "/hero/luxury-resort-courtyard.webp",
            alt: "Роскошный курортный дворик с пальмами и восточной архитектурой",
            order: 2,
            isActive: true,
          },
          {
            id: 3,
            image: "/hero/tropical-islands-aerial.webp",
            alt: "Аэрофотосъемка тропических островов с бирюзовой водой",
            order: 3,
            isActive: true,
          },
          {
            id: 4,
            image: "/hero/thailand-flag-mountain-view.webp",
            alt: "Человек с флагом Таиланда на горной вершине",
            order: 4,
            isActive: true,
          },
        ],
        updatedAt: new Date().toISOString(),
      }
}

// Сохранение настроек главной страницы
function saveHomeSettings(settings: HomePageSettings): void {
  if (typeof window === "undefined") return
  localStorage.setItem(HOME_SETTINGS_KEY, JSON.stringify(settings))
}

// Экспорт функций для настроек главной страницы
export function getHomePageSettings(): HomePageSettings {
  return getHomeSettings()
}

export function updateHomePageSettings(data: {
  heroTitle?: string
  heroSubtitle?: string
  heroButtonText?: string
  slides?: HeroSlide[]
}): { success: boolean; error?: string; settings?: HomePageSettings } {
  try {
    const currentSettings = getHomeSettings()

    const updatedSettings: HomePageSettings = {
      ...currentSettings,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    saveHomeSettings(updatedSettings)
    return { success: true, settings: updatedSettings }
  } catch (error) {
    return { success: false, error: "Ошибка при обновлении настроек" }
  }
}

// Добавить функции для работы со слайдами
export function createHeroSlide(data: {
  image: string
  alt: string
}): { success: boolean; error?: string; slide?: HeroSlide } {
  try {
    const settings = getHomeSettings()
    const maxOrder = Math.max(0, ...settings.slides.map((s) => s.order))

    const newSlide: HeroSlide = {
      id: Math.max(0, ...settings.slides.map((s) => s.id)) + 1,
      image: data.image,
      alt: data.alt,
      order: maxOrder + 1,
      isActive: true,
    }

    settings.slides.push(newSlide)
    settings.updatedAt = new Date().toISOString()

    saveHomeSettings(settings)
    return { success: true, slide: newSlide }
  } catch (error) {
    return { success: false, error: "Ошибка при создании слайда" }
  }
}

export function updateHeroSlide(
  id: number,
  data: Partial<Pick<HeroSlide, "image" | "alt" | "order" | "isActive">>,
): { success: boolean; error?: string; slide?: HeroSlide } {
  try {
    const settings = getHomeSettings()
    const slideIndex = settings.slides.findIndex((s) => s.id === id)

    if (slideIndex === -1) {
      return { success: false, error: "Слайд не найден" }
    }

    settings.slides[slideIndex] = {
      ...settings.slides[slideIndex],
      ...data,
    }
    settings.updatedAt = new Date().toISOString()

    saveHomeSettings(settings)
    return { success: true, slide: settings.slides[slideIndex] }
  } catch (error) {
    return { success: false, error: "Ошибка при обновлении слайда" }
  }
}

export function deleteHeroSlide(id: number): { success: boolean; error?: string } {
  try {
    const settings = getHomeSettings()
    const originalLength = settings.slides.length

    settings.slides = settings.slides.filter((s) => s.id !== id)

    if (settings.slides.length === originalLength) {
      return { success: false, error: "Слайд не найден" }
    }

    // Перенумеровываем порядок слайдов
    settings.slides.forEach((slide, index) => {
      slide.order = index + 1
    })

    settings.updatedAt = new Date().toISOString()
    saveHomeSettings(settings)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Ошибка при удалении слайда" }
  }
}

// Функции для музыки
function getMusicTracks(): MusicTrack[] {
  if (typeof window === "undefined") return []
  const tracks = localStorage.getItem(MUSIC_TRACKS_KEY)
  return tracks ? JSON.parse(tracks) : []
}

function saveMusicTracks(tracks: MusicTrack[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(MUSIC_TRACKS_KEY, JSON.stringify(tracks))
}

export function getAllMusicTracks(): MusicTrack[] {
  return getMusicTracks().sort((a, b) => a.order - b.order)
}

export function getActiveMusicTracks(): MusicTrack[] {
  return getMusicTracks()
    .filter((t) => t.isActive)
    .sort((a, b) => a.order - b.order)
}

export function createMusicTrack(data: {
  name: string
  artist: string
  coverImage: string
  youtubeUrl: string
  order?: number
}): { success: boolean; error?: string; track?: MusicTrack } {
  try {
    const tracks = getMusicTracks()
    const maxOrder = Math.max(0, ...tracks.map((t) => t.order))

    const newTrack: MusicTrack = {
      id: Math.max(0, ...tracks.map((t) => t.id)) + 1,
      name: data.name,
      artist: data.artist,
      coverImage: data.coverImage,
      youtubeUrl: data.youtubeUrl,
      order: data.order || maxOrder + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    tracks.push(newTrack)
    saveMusicTracks(tracks)

    return { success: true, track: newTrack }
  } catch (error) {
    return { success: false, error: "Ошибка при создании трека" }
  }
}

export function updateMusicTrack(
  id: number,
  data: Partial<Pick<MusicTrack, "name" | "artist" | "coverImage" | "youtubeUrl" | "order" | "isActive">>,
): { success: boolean; error?: string; track?: MusicTrack } {
  try {
    const tracks = getMusicTracks()
    const index = tracks.findIndex((t) => t.id === id)

    if (index === -1) {
      return { success: false, error: "Трек не найден" }
    }

    tracks[index] = {
      ...tracks[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    saveMusicTracks(tracks)
    return { success: true, track: tracks[index] }
  } catch (error) {
    return { success: false, error: "Ошибка при обновлении трека" }
  }
}

export function deleteMusicTrack(id: number): { success: boolean; error?: string } {
  try {
    const tracks = getMusicTracks()
    const filteredTracks = tracks.filter((t) => t.id !== id)

    if (tracks.length === filteredTracks.length) {
      return { success: false, error: "Трек не найден" }
    }

    saveMusicTracks(filteredTracks)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Ошибка при удалении трека" }
  }
}

// Функции для культурного видео
function getCultureVideo(): CultureVideo | null {
  if (typeof window === "undefined") return null
  const video = localStorage.getItem(CULTURE_VIDEO_KEY)
  return video ? JSON.parse(video) : null
}

function saveCultureVideo(video: CultureVideo): void {
  if (typeof window === "undefined") return
  localStorage.setItem(CULTURE_VIDEO_KEY, JSON.stringify(video))
}

export function getCultureVideoSettings(): CultureVideo | null {
  return getCultureVideo()
}

export function updateCultureVideo(data: {
  title?: string
  description?: string
  youtubeUrl?: string
  thumbnail?: string
  isActive?: boolean
}): { success: boolean; error?: string; video?: CultureVideo } {
  try {
    const currentVideo = getCultureVideo()

    const updatedVideo: CultureVideo = {
      id: 1,
      title: data.title || (currentVideo?.title ?? "Видео о тайской культуре"),
      description:
        data.description || (currentVideo?.description ?? "Познакомьтесь с богатой культурой и традициями Таиланда"),
      youtubeUrl: data.youtubeUrl || (currentVideo?.youtubeUrl ?? ""),
      thumbnail: data.thumbnail || (currentVideo?.thumbnail ?? ""),
      isActive: data.isActive !== undefined ? data.isActive : (currentVideo?.isActive ?? true),
      updatedAt: new Date().toISOString(),
    }

    saveCultureVideo(updatedVideo)
    return { success: true, video: updatedVideo }
  } catch (error) {
    return { success: false, error: "Ошибка при обновлении видео" }
  }
}

// Функции для блога
function getBlogPosts(): BlogPost[] {
  if (typeof window === "undefined") return []
  const posts = localStorage.getItem(BLOG_POSTS_KEY)
  return posts ? JSON.parse(posts) : []
}

function saveBlogPosts(posts: BlogPost[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(BLOG_POSTS_KEY, JSON.stringify(posts))
}

function getBlogCategoriesData(): BlogCategory[] {
  if (typeof window === "undefined") return []
  const categories = localStorage.getItem(BLOG_CATEGORIES_KEY)
  return categories ? JSON.parse(categories) : []
}

function saveBlogCategories(categories: BlogCategory[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(BLOG_CATEGORIES_KEY, JSON.stringify(categories))
}

export function getAllBlogPosts(): BlogPost[] {
  return getBlogPosts().sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export function getActiveBlogPosts(): BlogPost[] {
  return getBlogPosts()
    .filter((p) => p.isActive)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export function getBlogPostById(id: number): BlogPost | null {
  return getBlogPosts().find((p) => p.id === id) || null
}

export function getBlogCategories(): BlogCategory[] {
  return getBlogCategoriesData()
    .filter((c) => c.isActive)
    .sort((a, b) => a.order - b.order)
}

export function createBlogPost(data: {
  title: string
  excerpt: string
  content: string
  image: string
  category: string
  slug: string
  publishedAt: string
  readTime: number
  isActive: boolean
}): { success: boolean; error?: string; post?: BlogPost } {
  try {
    const posts = getBlogPosts()

    const newPost: BlogPost = {
      id: Math.max(0, ...posts.map((p) => p.id)) + 1,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      image: data.image,
      category: data.category,
      slug: data.slug,
      publishedAt: data.publishedAt,
      readTime: data.readTime,
      isActive: data.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    posts.push(newPost)
    saveBlogPosts(posts)

    return { success: true, post: newPost }
  } catch (error) {
    return { success: false, error: "Ошибка при создании поста" }
  }
}

export function updateBlogPost(
  id: number,
  data: Partial<BlogPost>,
): { success: boolean; error?: string; post?: BlogPost } {
  try {
    const posts = getBlogPosts()
    const index = posts.findIndex((p) => p.id === id)

    if (index === -1) {
      return { success: false, error: "Пост не найден" }
    }

    posts[index] = {
      ...posts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    saveBlogPosts(posts)
    return { success: true, post: posts[index] }
  } catch (error) {
    return { success: false, error: "Ошибка при обновлении поста" }
  }
}

export function deleteBlogPost(id: number): { success: boolean; error?: string } {
  try {
    const posts = getBlogPosts()
    const filteredPosts = posts.filter((p) => p.id !== id)

    if (posts.length === filteredPosts.length) {
      return { success: false, error: "Пост не найден" }
    }

    saveBlogPosts(filteredPosts)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Ошибка при удалении поста" }
  }
}

// Функции для новостей
function getNews(): NewsItem[] {
  if (typeof window === "undefined") return []

  const newsData = localStorage.getItem(NEWS_KEY)

  if (!newsData) {
    return []
  }

  try {
    const news = JSON.parse(newsData)
    return news
  } catch (error) {
    return []
  }
}

function saveNews(news: NewsItem[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(NEWS_KEY, JSON.stringify(news))
}

export function getAllNews(): NewsItem[] {
  const news = getNews()
  const sorted = news.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  return sorted
}

export function getActiveNews(): NewsItem[] {
  const allNews = getNews()
  const activeNews = allNews.filter((n) => n.isActive)
  const sorted = activeNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  return sorted
}

export function getFeaturedNews(): NewsItem | null {
  const news = getActiveNews()
  return news.find((n) => n.isFeatured) || news[0] || null
}

export function getRecentNews(limit = 3): NewsItem[] {
  return getActiveNews()
    .filter((n) => !n.isFeatured)
    .slice(0, limit)
}

export function getNewsById(id: number): NewsItem | null {
  const news = getNews()
  return news.find((n) => n.id === id) || null
}

// CRUD операции для новостей
export function createNewsItem(data: {
  title: string
  excerpt: string
  content: string
  image: string
  category: string
  isActive: boolean
  isFeatured: boolean
}): { success: boolean; error?: string; news?: NewsItem } {
  try {
    const news = getNews()

    const newNews: NewsItem = {
      id: Math.max(0, ...news.map((n) => n.id)) + 1,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      image: data.image,
      category: data.category,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    news.push(newNews)
    saveNews(news)

    return { success: true, news: newNews }
  } catch (error) {
    return { success: false, error: "Ошибка при создании новости" }
  }
}

export function updateNewsItem(
  id: number,
  data: Partial<Pick<NewsItem, "title" | "excerpt" | "content" | "image" | "category" | "isActive" | "isFeatured">>,
): { success: boolean; error?: string; news?: NewsItem } {
  try {
    const news = getNews()
    const index = news.findIndex((n) => n.id === id)

    if (index === -1) {
      return { success: false, error: "Новость не найдена" }
    }

    news[index] = {
      ...news[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    saveNews(news)
    return { success: true, news: news[index] }
  } catch (error) {
    return { success: false, error: "Ошибка при обновлении новости" }
  }
}

export function deleteNewsItem(id: number): { success: boolean; error?: string } {
  try {
    const news = getNews()
    const filteredNews = news.filter((n) => n.id !== id)

    if (news.length === filteredNews.length) {
      return { success: false, error: "Новость не найдена" }
    }

    saveNews(filteredNews)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Ошибка при удалении новости" }
  }
}

// Функции для виджетов новостей
function getNewsWidgets(): NewsWidget[] {
  if (typeof window === "undefined") return []
  const widgets = localStorage.getItem(NEWS_WIDGETS_KEY)
  return widgets ? JSON.parse(widgets) : []
}

function saveNewsWidgets(widgets: NewsWidget[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(NEWS_WIDGETS_KEY, JSON.stringify(widgets))
}

export function getAllNewsWidgets(): NewsWidget[] {
  return getNewsWidgets().sort((a, b) => a.order - b.order)
}

export function getActiveNewsWidgets(): NewsWidget[] {
  return getNewsWidgets()
    .filter((w) => w.isActive)
    .sort((a, b) => a.order - b.order)
}

export function createNewsWidget(data: {
  type: NewsWidget["type"]
  title: string
  settings: NewsWidget["settings"]
  order?: number
}): { success: boolean; error?: string; widget?: NewsWidget } {
  try {
    const widgets = getNewsWidgets()
    const maxOrder = Math.max(0, ...widgets.map((w) => w.order))

    const newWidget: NewsWidget = {
      id: Math.max(0, ...widgets.map((w) => w.id)) + 1,
      type: data.type,
      title: data.title,
      isActive: true,
      order: data.order || maxOrder + 1,
      settings: data.settings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    widgets.push(newWidget)
    saveNewsWidgets(widgets)

    return { success: true, widget: newWidget }
  } catch (error) {
    return { success: false, error: "Ошибка при создании виджета" }
  }
}

export function updateNewsWidget(
  id: number,
  data: Partial<Pick<NewsWidget, "title" | "isActive" | "order" | "settings">>,
): { success: boolean; error?: string; widget?: NewsWidget } {
  try {
    const widgets = getNewsWidgets()
    const index = widgets.findIndex((w) => w.id === id)

    if (index === -1) {
      return { success: false, error: "Виджет не найден" }
    }

    widgets[index] = {
      ...widgets[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    saveNewsWidgets(widgets)
    return { success: true, widget: widgets[index] }
  } catch (error) {
    return { success: false, error: "Ошибка при обновлении виджета" }
  }
}

export function deleteNewsWidget(id: number): { success: boolean; error?: string } {
  try {
    const widgets = getNewsWidgets()
    const filteredWidgets = widgets.filter((w) => w.id !== id)

    if (widgets.length === filteredWidgets.length) {
      return { success: false, error: "Виджет не найден" }
    }

    saveNewsWidgets(filteredWidgets)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Ошибка при удалении виджета" }
  }
}

// Инициализация тестовых данных для музыки и видео
function initMusicAndVideoData() {
  if (typeof window === "undefined") return

  // Инициализация музыки
  const existingTracks = localStorage.getItem(MUSIC_TRACKS_KEY)
  if (!existingTracks) {
    const defaultTracks: MusicTrack[] = [
      {
        id: 1,
        name: "วันจันทร์",
        artist: "Only Monday (GeneLab)",
        coverImage: "",
        youtubeUrl: "https://youtu.be/AG2hEkIcxWE",
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "เริ่มใหม่",
        artist: "Three Man Down",
        coverImage: "",
        youtubeUrl: "https://www.youtube.com/watch?v=8U4HrSKu9AI",
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        name: "Тайская народная музыка",
        artist: "Народные исполнители",
        coverImage: "",
        youtubeUrl: "https://youtu.be/_U61ymNHBcU",
        order: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(MUSIC_TRACKS_KEY, JSON.stringify(defaultTracks))
  }

  // Инициализация культурного видео
  const existingVideo = localStorage.getItem(CULTURE_VIDEO_KEY)
  if (!existingVideo) {
    const defaultVideo: CultureVideo = {
      id: 1,
      title: "Тайская культура и традиции",
      description:
        "Познакомьтесь с богатой культурой и традициями Таиланда, включая буддизм, архитектуру и народные обычаи",
      youtubeUrl: "https://www.youtube.com/watch?v=v86OlB4f2QY",
      thumbnail: "/placeholder.svg?height=400&width=600&text=Thai+Culture+Video",
      isActive: true,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(CULTURE_VIDEO_KEY, JSON.stringify(defaultVideo))
  }
}

// Инициализация данных блога
function initBlogData() {
  if (typeof window === "undefined") return

  // Инициализация категорий блога
  const existingCategories = localStorage.getItem(BLOG_CATEGORIES_KEY)
  if (!existingCategories) {
    const defaultCategories: BlogCategory[] = [
      {
        id: "culture",
        name: "Культура",
        slug: "culture",
        isActive: true,
        order: 1,
      },
      {
        id: "travel",
        name: "Путешествия",
        slug: "travel",
        isActive: true,
        order: 2,
      },
      {
        id: "food",
        name: "Еда",
        slug: "food",
        isActive: true,
        order: 3,
      },
      {
        id: "tips",
        name: "Советы",
        slug: "tips",
        isActive: true,
        order: 4,
      },
      {
        id: "history",
        name: "История",
        slug: "history",
        isActive: true,
        order: 5,
      },
      {
        id: "nature",
        name: "Природа",
        slug: "nature",
        isActive: true,
        order: 6,
      },
    ]
    localStorage.setItem(BLOG_CATEGORIES_KEY, JSON.stringify(defaultCategories))
  }

  // Инициализация постов блога
  const existingPosts = localStorage.getItem(BLOG_POSTS_KEY)
  if (!existingPosts) {
    const defaultPosts: BlogPost[] = [
      {
        id: 1,
        title: "Традиции и обычаи тайской культуры",
        excerpt: "Узнайте о главных аспектах культуры Таиланда, от праздников до повседневной жизни.",
        content: `# Традиции и обычаи тайской культуры

Таиланд - страна с богатой культурой и древними традициями, которые до сих пор играют важную роль в повседневной жизни тайцев.

## Буддизм в Таиланде

Более 95% населения Таиланда исповедует буддизм Тхеравады. Это влияет на все аспекты жизни:
- Ежедневные молитвы и медитации
- Посещение храмов по особым дням
- Подношения монахам

## Традиционные праздники

### Сонгкран (Тайский Новый год)
Самый важный праздник в году, отмечается в апреле водными битвами и религиозными церемониями.

### Лой Кратонг
Праздник фонарей, когда люди пускают по воде маленькие плоты со свечами.

## Этикет и манеры

- Уважение к старшим
- Снятие обуви при входе в дом
- Особое почтение к королевской семье`,
        image: "/blog/thai-culture-buddha.jpg",
        category: "culture",
        slug: "thai-culture-traditions",
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        readTime: 8,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Лучшие ночные рынки Бангкока",
        excerpt: "Откройте для себя атмосферу и разнообразие ночных рынков столицы Таиланда.",
        content: `# Лучшие ночные рынки Бангкока

Ночные рынки Бангкока - это не просто места для покупок, это целая культура и атмосфера.

## Чатучак Weekend Market

Самый большой рынок в Таиланде:
- Более 15,000 торговых точек
- Работает только по выходным
- Все виды товаров от одежды до антиквариата

## Rot Fai Market (Train Market)

Популярный среди молодежи:
- Винтажные вещи и handmade товары
- Уличная еда и живая музыка
- Атмосфера старого железнодорожного депо

## Saphan Phut Night Market

Оптовый рынок одежды:
- Работает всю ночь
- Очень низкие цены
- Популярен среди местных жителей`,
        image: "/placeholder.svg?height=300&width=400&text=Bangkok+Night+Market",
        category: "travel",
        slug: "bangkok-night-markets",
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        readTime: 6,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        title: "Тайская кухня: 5 блюд, которые стоит попробовать",
        excerpt: "Подборка самых ярких и популярных блюд Таиланда, которые стоит попробовать каждому туристу.",
        content: `# Тайская кухня: 5 блюд, которые стоит попробовать

Тайская кухня известна своим балансом сладкого, кислого, соленого и острого вкусов.

## 1. Том Ям Гунг

Знаменитый острый суп с креветками:
- Основа: бульон с лемонграссом и листьями лайма
- Главные ингредиенты: креветки, грибы, помидоры
- Особенность: идеальный баланс кислого и острого

## 2. Пад Тай

Самое известное тайское блюдо в мире:
- Жареная рисовая лапша
- С креветками, тофу или курицей
- Подается с арахисом и лаймом

## 3. Сом Там

Острый салат из зеленой папайи:
- Свежий и хрустящий
- С помидорами черри и стручковой фасолью
- Заправка из рыбного соуса и лайма

## 4. Массаман Карри

Мягкое карри с персидскими корнями:
- Обычно с говядиной или курицей
- Сладковатый вкус с корицей и кардамоном
- Подается с рисом жасмин

## 5. Манго с клейким рисом

Популярный десерт:
- Сладкий клейкий рис с кокосовым молоком
- Спелое манго
- Простой, но невероятно вкусный`,
        image: "/placeholder.svg?height=300&width=400&text=Thai+Food",
        category: "food",
        slug: "thai-cuisine-top-5-dishes",
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        readTime: 5,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 4,
        title: "Советы для первого путешествия в Таиланд",
        excerpt: "Как подготовиться к поездке в Таиланд: что взять с собой, что учесть, что остерегаться.",
        content: `# Советы для первого путешествия в Таиланд

Планируете свою первую поездку в Страну Улыбок? Эти советы помогут вам избежать типичных ошибок.

## Документы и виза

- Паспорт должен быть действителен минимум 6 месяцев
- Для россиян виза не нужна при пребывании до 30 дней
- Обязательно оформите медицинскую страховку

## Что взять с собой

### Одежда
- Легкая одежда из натуральных тканей
- Длинные брюки и рубашки для храмов
- Дождевик (особенно в сезон дождей)

### Лекарства
- Средства от расстройства желудка
- Репелленты от комаров
- Солнцезащитный крем с высоким SPF

## Деньги и торговля

- Основная валюта - тайский бат
- Торгуйтесь на рынках, но не в магазинах
- Чаевые в ресторанах - 10% от счета

## Безопасность

- Не пейте воду из-под крана
- Остерегайтесь мошенников возле храмов
- Не трогайте бездомных животных

## Культурные особенности

- Снимайте обувь при входе в храмы и дома
- Не прикасайтесь к голове тайцев
- Уважительно относитесь к изображениям короля`,
        image: "/placeholder.svg?height=300&width=400&text=Thailand+Travel+Tips",
        category: "tips",
        slug: "thailand-travel-tips",
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        readTime: 7,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 5,
        title: "История древнего Сиама",
        excerpt: "Погружение в богатую историю Таиланда от древних королевств до современности.",
        content: `# История древнего Сиама

Таиланд - единственная страна в Юго-Восточной Азии, которая никогда не была колонизирована европейцами.

## Древние королевства

### Королевство Сукхотай (1238-1438)
- Первое независимое тайское государство
- Создание тайского алфавита
- Расцвет буддийского искусства

### Аюттхая (1351-1767)
- Могущественная торговая империя
- Один из крупнейших городов мира своего времени
- Разрушена бирманцами в 1767 году

## Династия Чакри

### Основание Бангкока (1782)
- Король Рама I основал новую столицу
- Строительство Королевского дворца
- Восстановление тайской культуры

### Модернизация (XIX век)
- Король Рама IV открыл страну для торговли
- Король Рама V провел реформы и отменил рабство
- Сохранение независимости через дипломатию

## Современный Таиланд

- 1932: Переход к конституционной монархии
- Вторая мировая война: сложный период
- Экономическое развитие и туризм`,
        image: "/photo/thai-buddha-temple.jpg",
        category: "history",
        slug: "ancient-siam-history",
        publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        readTime: 10,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 6,
        title: "Национальные парки Таиланда",
        excerpt: "Откройте для себя удивительную природу Таиланда в его национальных парках.",
        content: `# Национальные парки Таиланда

Таиланд может похвастаться более чем 100 национальными парками, защищающими уникальную флору и фауну.

## Као Яй

Первый и самый известный национальный парк:
- Основан в 1962 году
- Объект Всемирного наследия ЮНЕСКО
- Дом для слонов, тигров и 300 видов птиц

### Что посмотреть:
- Водопад Хео Нарок (150 метров)
- Смотровые площадки
- Ночные сафари

## Дой Интханон

Самая высокая точка Таиланда:
- Высота 2565 метров
- Прохладный климат круглый год
- Красивые пагоды короля и королевы

### Особенности:
- Рододендроновые сады
- Водопады Вачиратан и Сиритан
- Деревня горных племен

## Эраван

Знаменит своими водопадами:
- Семиуровневый водопад Эраван
- Изумрудные бассейны для купания
- Пещеры с древними наскальными рисунками

## Као Сок

Один из старейших тропических лесов:
- Возраст более 160 миллионов лет
- Озеро Чео Лан с плавучими бунгало
- Уникальная флора и фауна`,
        image: "/photo/tropical-beach.jpg",
        category: "nature",
        slug: "thailand-national-parks",
        publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        readTime: 9,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(BLOG_POSTS_KEY, JSON.stringify(defaultPosts))
  }
}

// Инициализация тестовых данных для новостей с расширенным набором
function initNewsData() {
  if (typeof window === "undefined") return

  const existingNews = localStorage.getItem(NEWS_KEY)
  if (!existingNews) {
    const now = new Date()
    const defaultNews: NewsItem[] = [
      // Новая новость о безопасности на границе с Камбоджей
      {
        id: 22,
        title: "Таиланд усилил меры безопасности на границе с Камбоджей",
        excerpt:
          "В связи с напряженной обстановкой на границе с Камбоджей, власти Таиланда усилили меры безопасности. Военно-воздушные силы Таиланда зафиксировали случаи использования БПЛА для шпионажа и призвали население сообщать о подозрительных беспилотниках.",
        content: `# Таиланд усилил меры безопасности на границе с Камбоджей

В связи с напряженной обстановкой на границе с Камбоджей, власти Таиланда усилили меры безопасности. Военно-воздушные силы Таиланда зафиксировали случаи использования БПЛА для шпионажа и призвали население сообщать о подозрительных беспилотниках.

## Основные меры безопасности

Принято решение о приобретении провинциальными властями средств борьбы с дронами и усилена охрана ключевых объектов. Тайские военные находятся в состоянии круглосуточной готовности.

## Призыв к населению

Военные призывают местных жителей и туристов сообщать о любых подозрительных беспилотных летательных аппаратах в приграничных районах.

## Текущая ситуация

Ситуация на границе остается напряженной, но контролируемой. Власти заверяют, что все необходимые меры для обеспечения безопасности граждан приняты.`,
        image: "/news/thailand-cambodia-border-security.jpg",
        publishedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 минут назад
        isActive: true,
        isFeatured: true, // Делаем эту новость главной
        category: "security",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Сегодняшние новости
      {
        id: 1,
        title: "Таиланд открывает новые туристические маршруты",
        excerpt:
          "Правительство Таиланда анонсировало открытие уникальных экскурсионных программ по северным провинциям страны.",
        content: "Полное содержание новости о новых маршрутах...",
        image: "/destinations/chiang-mai.jpg",
        publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 часа назад
        isActive: true,
        isFeatured: false, // Убираем featured с предыдущей новости
        category: "tourism",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Новые экологические инициативы в национальных парках",
        excerpt: "Министерство природных ресурсов запускает программу по защите морских экосистем.",
        content: "Подробности об экологических программах...",
        image: "/photo/tropical-beach.jpg",
        publishedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 часа назад
        isActive: true,
        isFeatured: false,
        category: "ecology",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        title: "Важные изменения в авиасообщении с Таиландом",
        excerpt: "Новые правила для международных рейсов вступают в силу с следующего месяца.",
        content: "Информация об изменениях в авиасообщении...",
        image: "/destinations/phuket.jpg",
        publishedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 часов назад
        isActive: true,
        isFeatured: false,
        category: "transport",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 4,
        title: "Крупные инвестиции в туристическую инфраструктуру",
        excerpt: "Правительство выделяет 5 миллиардов бат на развитие курортных зон.",
        content: "Детали инвестиционной программы...",
        image: "/destinations/koh-samui.jpg",
        publishedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(), // 8 часов назад
        isActive: true,
        isFeatured: false,
        category: "investments",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // Вчерашние новости
      {
        id: 5,
        title: "Фестиваль фонарей в Чиангмае",
        excerpt: "Ежегодный фестиваль Лой Кратонг пройдет в ноябре с особой программой.",
        content: "Подробности о фестивале фонарей...",
        image: "/photo/thai-buddha-temple.jpg",
        publishedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 день назад
        isActive: true,
        isFeatured: false,
        category: "culture",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 6,
        title: "Полиция усиливает контроль на туристических объектах",
        excerpt: "Новые меры безопасности для защиты туристов в популярных местах отдыха.",
        content: "Информация о мерах безопасности...",
        image: "/destinations/pattaya.png",
        publishedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(), // 1 день 2 часа назад
        isActive: true,
        isFeatured: false,
        category: "police",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 7,
        title: "Обыски в нелегальных турагентствах Паттайи",
        excerpt: "Власти проводят операцию против мошеннических схем в туристическом бизнесе.",
        content: "Подробности операции правоохранительных органов...",
        image: "/destinations/pattaya.png",
        publishedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(), // 1 день 4 часа назад
        isActive: true,
        isFeatured: false,
        category: "investigation",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // 2 дня назад
      {
        id: 8,
        title: "Новый аэропорт на Пхукете",
        excerpt: "Строительство нового терминала завершится к концу года.",
        content: "Информация о новом аэропорте...",
        image: "/destinations/phuket.jpg",
        publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 дня назад
        isActive: true,
        isFeatured: false,
        category: "transport",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 9,
        title: "Нарушения экологических норм на Ко Самуи",
        excerpt: "Местные власти выявили серьезные нарушения в сфере утилизации отходов.",
        content: "Детали экологических нарушений...",
        image: "/destinations/koh-samui.jpg",
        publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(), // 2 дня 3 часа назад
        isActive: true,
        isFeatured: false,
        category: "violations",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 10,
        title: "Кулинарные туры по Бангкоку",
        excerpt: "Новые гастрономические экскурсии по уличной еде столицы.",
        content: "Детали кулинарных туров...",
        image: "/destinations/bangkok.jpg",
        publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000).toISOString(), // 2 дня 6 часов назад
        isActive: true,
        isFeatured: false,
        category: "food",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // 3 дня назад
      {
        id: 11,
        title: "Важные изменения в визовом режиме",
        excerpt: "Новые правила оформления туристических виз для граждан России.",
        content: "Подробности изменений в визовом режиме...",
        image: "/photo/thailand-coastline.jpg",
        publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 дня назад
        isActive: true,
        isFeatured: false,
        category: "important",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 12,
        title: "Модернизация транспортной системы Бангкока",
        excerpt: "Запуск новых линий метро и улучшение автобусного сообщения.",
        content: "Информация о развитии транспорта...",
        image: "/destinations/bangkok.jpg",
        publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(), // 3 дня 2 часа назад
        isActive: true,
        isFeatured: false,
        category: "transport",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // 4 дня назад
      {
        id: 13,
        title: "Международные инвестиции в солнечную энергетику",
        excerpt: "Крупные зарубежные компании инвестируют в возобновляемые источники энергии.",
        content: "Детали инвестиционных проектов...",
        image: "/photo/tropical-beach.jpg",
        publishedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 дня назад
        isActive: true,
        isFeatured: false,
        category: "investments",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 14,
        title: "Полицейская операция против наркоторговли",
        excerpt: "Крупная операция по борьбе с наркотрафиком в туристических зонах.",
        content: "Подробности полицейской операции...",
        image: "/destinations/phuket.jpg",
        publishedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(), // 4 дня 4 часа назад
        isActive: true,
        isFeatured: false,
        category: "police",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // 5 дней назад
      {
        id: 15,
        title: "Экологическая программа по очистке пляжей",
        excerpt: "Волонтеры и местные жители объединились для защиты морской среды.",
        content: "Информация об экологической программе...",
        image: "/photo/tropical-beach.jpg",
        publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 дней назад
        isActive: true,
        isFeatured: false,
        category: "ecology",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // Дополнительные новости для большего количества
      {
        id: 16,
        title: "Новые правила безопасности в аэропортах",
        excerpt: "Усиленные меры контроля для международных пассажиров.",
        content: "Подробности новых правил безопасности...",
        image: "/destinations/bangkok.jpg",
        publishedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        isFeatured: false,
        category: "important",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 17,
        title: "Расследование коррупции в туристической полиции",
        excerpt: "Журналисты раскрыли схему взяточничества среди сотрудников.",
        content: "Детали журналистского расследования...",
        image: "/destinations/pattaya.png",
        publishedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        isFeatured: false,
        category: "investigation",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 18,
        title: "Штрафы за нарушение экологических норм увеличены",
        excerpt: "Правительство ужесточает наказание за загрязнение окружающей среды.",
        content: "Информация о новых штрафах...",
        image: "/photo/tropical-beach.jpg",
        publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        isFeatured: false,
        category: "violations",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 19,
        title: "Крупные инвестиции в развитие железных дорог",
        excerpt: "Китайские компании вкладывают средства в модернизацию транспорта.",
        content: "Подробности инвестиционных планов...",
        image: "/destinations/chiang-mai.jpg",
        publishedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        isFeatured: false,
        category: "investments",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 20,
        title: "Традиционный фестиваль еды в Чиангмае",
        excerpt: "Ежегодное празднование тайской кухни привлекает тысячи туристов.",
        content: "Программа фестиваля еды...",
        image: "/destinations/chiang-mai.jpg",
        publishedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        isFeatured: false,
        category: "food",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Старая новость о безопасности (теперь не featured)
      {
        id: 21,
        title: "Повышенная террористическая угроза в туристических зонах",
        excerpt: "Власти предупреждают о возможных террористических атаках в популярных туристических местах.",
        content: "Подробная информация о мерах безопасности и рекомендациях для туристов...",
        image: "/destinations/bangkok.jpg",
        publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 часа назад
        isActive: true,
        isFeatured: false, // Убираем featured
        category: "security",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    localStorage.setItem(NEWS_KEY, JSON.stringify(defaultNews))
  }
}

// Инициализация виджетов новостей
function initNewsWidgets() {
  if (typeof window === "undefined") return

  const existingWidgets = localStorage.getItem(NEWS_WIDGETS_KEY)
  if (!existingWidgets) {
    const defaultWidgets: NewsWidget[] = [
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
          color: "blue",
          bgColor: "from-blue-50 to-indigo-100",
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
          status: "danger", // Устанавливаем опасный статус для демонстрации
          level: "высокий",
          reason: "Повышенная террористическая угроза на границе с Камбоджей",
          relatedNewsId: 22, // Связываем с новой новостью о безопасности
          icon: "Shield",
          color: "red",
          bgColor: "from-red-50 to-pink-100",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        type: "emergency",
        title: "Экстренные службы",
        isActive: true,
        order: 3,
        settings: {
          phone: "191",
          description: "Нажмите для звонка",
          icon: "Phone",
          color: "red",
          bgColor: "from-red-50 to-pink-100",
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
          phone: "+66 2 234 2012",
          description: "Нажмите для звонка",
          icon: "MapPin",
          color: "blue",
          bgColor: "from-blue-50 to-cyan-100",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 5,
        type: "tourist-help",
        title: "Туристическая помощь",
        isActive: true,
        order: 5,
        settings: {
          phone: "1672",
          description: "Нажмите для звонка",
          icon: "Info",
          color: "purple",
          bgColor: "from-purple-50 to-violet-100",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(NEWS_WIDGETS_KEY, JSON.stringify(defaultWidgets))
  }
}

// НОВАЯ инициализация партнерских уведомлений с массивом и новыми полями
function initPartnerNotificationData() {
  if (typeof window !== "undefined") {
    const existingNotifications = localStorage.getItem(PARTNER_NOTIFICATIONS_KEY)
    const oldNotification = localStorage.getItem("thailand_partner_notification")

    if (!existingNotifications) {
      let defaultNotifications: PartnerNotification[] = []
      
      if (oldNotification) {
        try {
          const oldData = JSON.parse(oldNotification)
          defaultNotifications.push({
            id: 1,
            title: oldData.title || "Специальное предложение от нашего партнера!",
            content: oldData.content || "Получите скидку 25% на туры по Таиланду. Ограниченное предложение только для посетителей нашего сайта.",
            ctaText: oldData.ctaText || "Узнать больше",
            ctaUrl: oldData.ctaUrl || "https://example.com/partner-offer",
            isActive: oldData.isActive !== undefined ? oldData.isActive : true,
            showAfterSeconds: oldData.showAfterSeconds || 20,
            showOnPages: oldData.showOnPages || {
              home: true,
              blog: true,
              news: true,
              destinations: true,
            },
            limitShows: false,
            maxShowsPerSession: 1,
            showRandomly: false,
            targetScope: 'pages',
            targetedNewsIds: [],
            targetedBlogIds: [],
            createdAt: oldData.createdAt || new Date().toISOString(),
            updatedAt: oldData.updatedAt || new Date().toISOString(),
          })
          localStorage.removeItem("thailand_partner_notification")
        } catch (error) {
          defaultNotifications.push({
            id: 1,
            title: "Специальное предложение от нашего партнера!",
            content: "Получите скидку 25% на туры по Таиланду. Ограниченное предложение только для посетителей нашего сайта.",
            ctaText: "Узнать больше",
            ctaUrl: "https://example.com/partner-offer",
            isActive: true,
            showAfterSeconds: 20,
            showOnPages: {
              home: true,
              blog: true,
              news: true,
              destinations: true,
            },
            limitShows: false,
            maxShowsPerSession: 1,
            showRandomly: false,
            targetScope: 'pages',
            targetedNewsIds: [],
            targetedBlogIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
      } else {
        defaultNotifications = [
          {
            id: 1,
            title: "🎉 Специальное предложение от нашего партнера!",
            content: "Получите скидку 25% на туры по Таиланду. Ограниченное предложение только для посетителей нашего сайта.",
            ctaText: "Узнать больше",
            ctaUrl: "https://example.com/partner-offer",
            isActive: true,
            showAfterSeconds: 20,
            showOnPages: {
              home: true,
              blog: true,
              news: false,
              destinations: true,
            },
            limitShows: true,
            maxShowsPerSession: 1,
            showRandomly: false,
            targetScope: 'pages',
            targetedNewsIds: [],
            targetedBlogIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            title: "🏛️ Эксклюзивные туры по храмам Таиланда",
            content: "Откройте для себя духовную сторону Таиланда с нашими гидами-экспертами. Скидка 15% на первое бронирование.",
            ctaText: "Забронировать тур",
            ctaUrl: "https://example.com/temple-tours",
            isActive: true,
            showAfterSeconds: 25,
            showOnPages: {
              home: false,
              blog: true,
              news: true,
              destinations: false,
            },
            limitShows: true,
            maxShowsPerSession: 3,
            showRandomly: true,
            targetScope: 'pages',
            targetedNewsIds: [],
            targetedBlogIds: [],
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 3,
            title: "🍜 Кулинарные мастер-классы в Бангкоке",
            content: "Научитесь готовить настоящие тайские блюда! Групповые и индивидуальные занятия с профессиональными поварами.",
            ctaText: "Записаться на мастер-класс",
            ctaUrl: "https://example.com/cooking-classes",
            isActive: true,
            showAfterSeconds: 30,
            showOnPages: {
              home: true,
              blog: false,
              news: false,
              destinations: true,
            },
            limitShows: false,
            maxShowsPerSession: 1,
            showRandomly: false,
            targetScope: 'pages',
            targetedNewsIds: [],
            targetedBlogIds: [],
            createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          }
        ]
      }
      
      localStorage.setItem(PARTNER_NOTIFICATIONS_KEY, JSON.stringify(defaultNotifications))
    }
  }
}

// Инициализация при импорте (только в браузере)
if (typeof window !== "undefined") {
  initDatabase()
}
