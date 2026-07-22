import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { useMyBookings } from "@/hooks/useBookings"
import { CountdownBadge } from "@/components/CountdownBadge"

const statusLabel: Record<string, { text: string; class: string }> = {
  pending: { text: "Menunggu Pembayaran", class: "bg-brass/10 text-brass border-brass/30" },
  confirmed: { text: "Terkonfirmasi", class: "bg-primary/10 text-primary border-primary/30" },
  cancelled: { text: "Dibatalkan", class: "bg-clay/10 text-clay border-clay/30" },
  completed: { text: "Selesai", class: "bg-section text-text-secondary border-border" },
}

const filters = [
  { value: "active", label: "Aktif" },
  { value: "all", label: "Semua" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
]

export default function MyBookings() {
  const { data } = useMyBookings()
  const [filter, setFilter] = useState("active")

  const filteredBookings = useMemo(() => {
    if (!data?.bookings) return []
    switch (filter) {
      case "active":
        return data.bookings.filter((b) => b.status === "pending" || b.status === "confirmed")
      case "completed":
        return data.bookings.filter((b) => b.status === "completed")
      case "cancelled":
        return data.bookings.filter((b) => b.status === "cancelled")
      default:
        return data.bookings
    }
  }, [data, filter])

  const counts = useMemo(() => {
    const bookings = data?.bookings ?? []
    return {
      active: bookings.filter((b) => b.status === "pending" || b.status === "confirmed").length,
      all: bookings.length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }
  }, [data])

  return (
    <section className="max-w-3xl mx-auto px-6 py-14 bg-paper">
      <h1 className="font-heading font-medium text-2xl text-ink mb-6">Booking Saya</h1>

      <div className="flex gap-2 mb-8 border-b border-border overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 font-mono text-xs uppercase tracking-wide px-4 py-3 border-b-2 transition-colors ${
              filter === f.value
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-ink"
            }`}
          >
            {f.label} ({counts[f.value as keyof typeof counts]})
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <p className="text-text-secondary text-center py-16">
          {filter === "active" ? "Tidak ada booking aktif saat ini." : "Belum ada riwayat di kategori ini."}
        </p>
      )}

      <div className="space-y-4">
        {filteredBookings.map((b) => {
          const status = statusLabel[b.status] ?? { text: b.status, class: "bg-section text-text-secondary border-border" }
          const isMuted = b.status === "cancelled"

          return (
            <div
              key={b.id}
              className={`relative bg-card border border-border rounded-md p-5 flex justify-between items-center ${
                isMuted ? "opacity-60" : ""
              }`}
            >
              <div className="absolute -top-2 left-6 w-3 h-3 rounded-full bg-paper border-2 border-border" />
              <div>
                <p className="font-mono text-xs text-text-secondary tracking-widest">{b.room?.room_number}</p>
                <p className="font-heading font-medium text-ink mt-0.5">{b.room?.room_type?.name}</p>
                <p className="text-sm text-text-secondary mt-1 font-mono">
                  Check-in {new Date(b.check_in).toLocaleDateString("id-ID")} · {b.duration_months} bulan
                </p>
                <p className="font-mono font-semibold text-primary mt-1">
                  Rp{b.total_price.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="text-right space-y-2">
                <span className={`inline-block font-mono text-[10px] uppercase tracking-wide px-3 py-1.5 rounded-sm border ${status.class}`}>
                  {status.text}
                </span>
                {b.status === "pending" && b.expires_at && (
                  <div>
                    <CountdownBadge expiresAt={b.expires_at} />
                  </div>
                )}
                {b.status === "pending" && (
                  <Link to={`/payment/${b.id}`} className="block text-sm font-heading font-medium text-primary hover:underline">
                    Upload Bukti Transfer
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}