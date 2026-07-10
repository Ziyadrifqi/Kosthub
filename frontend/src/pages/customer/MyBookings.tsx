import { Link } from "react-router-dom"
import { useMyBookings } from "@/hooks/useBookings"
import { CountdownBadge } from "@/components/CountdownBadge"

const statusLabel: Record<string, { text: string; class: string }> = {
  pending: { text: "Menunggu Pembayaran", class: "bg-warning/10 text-warning" },
  confirmed: { text: "Terkonfirmasi", class: "bg-primary/10 text-primary" },
  cancelled: { text: "Dibatalkan", class: "bg-error/10 text-error" },
  completed: { text: "Selesai", class: "bg-info/10 text-info" },
}

export default function MyBookings() {
  const { data } = useMyBookings()

  return (
    <section className="max-w-3xl mx-auto px-6 py-14">
      <h1 className="font-heading font-extrabold text-2xl text-text mb-8">Booking Saya</h1>

      {data?.bookings.length === 0 && (
        <p className="text-text-secondary text-center py-16">Belum ada riwayat booking.</p>
      )}

      <div className="space-y-4">
        {data?.bookings.map((b) => {
          const status = statusLabel[b.status] ?? { text: b.status, class: "bg-section text-text-secondary" }
          return (
            <div key={b.id} className="bg-card border border-border rounded-xl p-5 flex justify-between items-center">
              <div>
                <p className="font-heading font-semibold text-text">
                  {b.room?.room_type?.name} · {b.room?.room_number}
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  Check-in {new Date(b.check_in).toLocaleDateString("id-ID")} · {b.duration_months} bulan
                </p>
                <p className="font-heading font-semibold text-primary mt-1">
                  Rp{b.total_price.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="text-right space-y-2">
                <span className={`inline-block text-xs font-heading font-semibold px-3 py-1.5 rounded-full ${status.class}`}>
                  {status.text}
                </span>
                {b.status === "pending" && b.expires_at && (
                  <div>
                    <CountdownBadge expiresAt={b.expires_at} />
                  </div>
                )}
                {b.status === "pending" && (
                  <Link
                    to={`/payment/${b.id}`}
                    className="block text-sm font-heading font-medium text-primary hover:underline"
                  >
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