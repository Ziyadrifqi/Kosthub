import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AlertCircle } from "lucide-react"
import { useRoomDetail } from "@/hooks/useRooms"
import { useCreateBooking } from "@/hooks/useBookings"
import { usePageTitle } from "@/hooks/usePageTitle"

export default function Booking() {
  usePageTitle("Booking Kamar")
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { data: room } = useRoomDetail(roomId ?? "")
  const createBooking = useCreateBooking()

  const [checkIn, setCheckIn] = useState("")
  const [duration, setDuration] = useState(1)

  const calculateEffectivePrice = () => {
    if (!room) return 0

    const dateActive = room.is_discount_active || room.has_conditional_discount
    if (!dateActive) return room.price

    const minMonths = room.discount_min_months
    const qualifiesForDiscount = !minMonths || duration >= minMonths
    if (!qualifiesForDiscount) return room.price

    if (room.discount_type === "percentage" && room.discount_value) {
      return room.price - (room.price * room.discount_value) / 100
    }
    if (room.discount_type === "fixed" && room.discount_value) {
      return Math.max(0, room.price - room.discount_value)
    }
    return room.price
  }

  const effectivePrice = calculateEffectivePrice()
  const totalPrice = effectivePrice * duration
  const isDiscountApplied = room ? effectivePrice < room.price : false

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!room) return
    createBooking.mutate(
      { room_id: room.id, check_in: checkIn, duration_months: duration },
      {
        onSuccess: (booking) => navigate(`/payment/${booking.id}`),
      }
    )
  }

  if (!room) return null

  return (
    <section className="max-w-lg mx-auto px-6 py-14 bg-paper">
      <h1 className="font-heading font-medium text-2xl text-ink mb-1">Booking Kamar</h1>
      <p className="text-text-secondary mb-8 font-mono text-sm">
        {room.room_type?.name} · {room.room_number} — {room.branch?.name}
      </p>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-md p-6 space-y-5">
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">Tanggal Check-in</label>
          <input
            type="date"
            required
            value={checkIn}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">Durasi Sewa (bulan)</label>
          <input
            type="number"
            min={1}
            required
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>

        {room.has_conditional_discount && !isDiscountApplied && (
          <p className="text-xs text-brass bg-brass/10 border border-brass/30 rounded-sm px-3 py-2">
            Tambah durasi jadi minimal {room.discount_min_months} bulan untuk dapat diskon.
          </p>
        )}
        {isDiscountApplied && (
          <p className="text-xs text-primary bg-primary/10 border border-primary/30 rounded-sm px-3 py-2">
            Diskon diterapkan! Hemat Rp{((room.price - effectivePrice) * duration).toLocaleString("id-ID")}.
          </p>
        )}

        <div className="border-t border-border pt-4 flex justify-between items-center">
          <span className="text-text-secondary text-sm">Total Pembayaran</span>
          <span className="font-mono font-semibold text-primary text-lg">
            Rp{totalPrice.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex items-start gap-2 bg-brass/10 text-brass border border-brass/30 text-xs rounded-sm p-3">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p>
            Setelah booking dibuat, kamu punya waktu <strong>24 jam</strong> untuk upload bukti transfer.
            Jika lewat dari itu, booking otomatis dibatalkan dan kamar dilepas kembali.
          </p>
        </div>

        {createBooking.isError && (
          <p className="text-clay text-sm font-mono">
            Gagal booking. Kamar mungkin sudah dipesan orang lain, coba kamar lain.
          </p>
        )}

        <button
          type="submit"
          disabled={createBooking.isPending}
          className="w-full font-heading font-medium bg-ink hover:bg-primary text-paper rounded-sm py-3 transition-colors disabled:opacity-60"
        >
          {createBooking.isPending ? "Memproses..." : "Konfirmasi Booking"}
        </button>
      </form>
    </section>
  )
}