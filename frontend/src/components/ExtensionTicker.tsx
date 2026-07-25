import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Clock } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useMyBookings } from "@/hooks/useBookings"

function daysUntilEnd(checkIn: string, durationMonths: number) {
  const end = new Date(checkIn)
  end.setMonth(end.getMonth() + durationMonths)
  return Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

// Ticker berjalan yang muncul di SEMUA halaman selama customer login,
// beda dari banner di kartu booking (yang cuma kelihatan pas buka "Booking Saya").
// Dua-duanya sengaja dipertahankan: ticker untuk awareness pasif di mana pun,
// banner untuk aksi langsung ("Perpanjang") begitu customer buka detailnya.
export function ExtensionTicker() {
  const token = useAuthStore((s) => s.token)
  const navigate = useNavigate()
  const { data } = useMyBookings()

  const soonList = useMemo(() => {
    if (!data?.bookings) return []
    return data.bookings.filter((b) => {
      if (b.status !== "confirmed") return false
      const days = daysUntilEnd(b.check_in, b.duration_months)
      return days >= 0 && days <= 5
    })
  }, [data])

  if (!token || soonList.length === 0) return null

  const messages = soonList.map(
    (b) => `Kamar ${b.room?.room_number} — masa sewa berakhir ${daysUntilEnd(b.check_in, b.duration_months)} hari lagi, klik untuk perpanjang`
  )
  const combined = messages.join("      •      ")

  return (
    <button
      onClick={() => navigate("/my-bookings")}
      className="w-full bg-brass/15 border-b border-brass/30 py-2 overflow-hidden text-left"
    >
      <div className="flex items-center gap-2 px-6">
        <Clock size={14} className="text-brass shrink-0" />
        <div className="overflow-hidden flex-1">
          <div className="flex whitespace-nowrap animate-marquee">
            <span className="font-mono text-xs text-brass pr-8">{combined}</span>
            <span className="font-mono text-xs text-brass pr-8">{combined}</span>
          </div>
        </div>
      </div>
    </button>
  )
}