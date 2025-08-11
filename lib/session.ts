export function newSessionId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function sevenDaysFromNowISO(): string {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
}
