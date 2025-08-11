// Класс для управления таймером уведомлений
export default class NotificationTimer {
  private timer: NodeJS.Timeout | null = null
  private startTime: number = 0
  private isRunning: boolean = false
  private callback: (() => void) | null = null
  private delay: number = 0

  constructor(delay: number, callback: () => void) {
    this.delay = delay
    this.callback = callback
  }

  start(): void {
    if (this.isRunning) return

    this.startTime = Date.now()
    this.isRunning = true
    
    this.timer = setTimeout(() => {
      if (this.callback) {
        this.callback()
      }
      this.isRunning = false
    }, this.delay * 1000) // конвертируем секунды в миллисекунды
  }

  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.isRunning = false
  }

  reset(): void {
    this.stop()
    this.start()
  }

  getElapsedTime(): number {
    if (!this.isRunning) return 0
    return Math.floor((Date.now() - this.startTime) / 1000)
  }

  getRemainingTime(): number {
    if (!this.isRunning) return 0
    const elapsed = this.getElapsedTime()
    return Math.max(0, this.delay - elapsed)
  }

  isActive(): boolean {
    return this.isRunning
  }
}
