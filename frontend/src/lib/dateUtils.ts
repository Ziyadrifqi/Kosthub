const TIMEZONE = "Asia/Jakarta"

export function formatChatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  })
}

export function formatChatDateSeparator(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isSameDay = (a: Date, b: Date) =>
    a.toLocaleDateString("en-CA", { timeZone: TIMEZONE }) === b.toLocaleDateString("en-CA", { timeZone: TIMEZONE })

  if (isSameDay(date, today)) return "Hari ini"
  if (isSameDay(date, yesterday)) return "Kemarin"

  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: TIMEZONE })
}

export function isDifferentDay(a: string, b: string): boolean {
  const dateA = new Date(a).toLocaleDateString("en-CA", { timeZone: TIMEZONE })
  const dateB = new Date(b).toLocaleDateString("en-CA", { timeZone: TIMEZONE })
  return dateA !== dateB
}