import { useReportSummary } from "@/hooks/useReports"

export default function OwnerReports() {
  const { data } = useReportSummary()
  if (!data) return null

  const mainCards = [
    { label: "Total Revenue (Terverifikasi)", value: `Rp${data.total_revenue.toLocaleString("id-ID")}` },
    { label: "Kamar Terisi", value: `${data.occupied_rooms}/${data.total_rooms}` },
    { label: "Payment Menunggu Verifikasi", value: data.pending_payments },
  ]

  const bookingBreakdown = [
    { label: "Menunggu Pembayaran", value: data.pending_bookings, color: "text-warning" },
    { label: "Terkonfirmasi", value: data.confirmed_bookings, color: "text-primary" },
    { label: "Selesai", value: data.completed_bookings, color: "text-text-secondary" },
    { label: "Dibatalkan", value: data.cancelled_bookings, color: "text-error" },
  ]

  return (
    <div className="p-8">
      <h1 className="font-heading font-extrabold text-2xl text-text mb-1">Laporan Bisnis</h1>
      <p className="text-text-secondary mb-8">Ringkasan kondisi bisnis saat ini.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {mainCards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm text-text-secondary">{c.label}</p>
            <p className="font-heading font-extrabold text-2xl text-text mt-2">{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-heading font-semibold text-lg text-text mb-1">
        Status Booking <span className="text-text-secondary font-normal text-sm">({data.total_bookings} total sepanjang waktu)</span>
      </h2>
      <p className="text-text-secondary text-sm mb-4">
        Breakdown status.
      </p>

      <div className="grid sm:grid-cols-4 gap-4">
        {bookingBreakdown.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm text-text-secondary">{c.label}</p>
            <p className={`font-heading font-extrabold text-2xl mt-2 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}