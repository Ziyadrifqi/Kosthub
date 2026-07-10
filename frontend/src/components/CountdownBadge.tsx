import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

export function CountdownBadge({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState("")

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) {
        setRemaining("Kedaluwarsa")
        return
      }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setRemaining(`${hours}j ${minutes}m`)
    }

    update()
    const interval = setInterval(update, 60 * 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const isUrgent = remaining !== "Kedaluwarsa" && remaining.startsWith("0j")

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-heading font-semibold px-3 py-1.5 rounded-full ${
        isUrgent || remaining === "Kedaluwarsa"
          ? "bg-error/10 text-error"
          : "bg-warning/10 text-warning"
      }`}
    >
      <Clock size={13} /> Sisa waktu bayar: {remaining}
    </span>
  )
}