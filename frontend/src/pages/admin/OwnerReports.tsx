import { useReportSummary } from "@/hooks/useReports"

export default function OwnerReports() {
  const { data } = useReportSummary()
  if (!data) return null

  const cards = [
    { label: "Total Revenue", value: `Rp${data.total_revenue.toLocaleString("id-ID")}` },
    { label: "Total Booking", value: data.total_bookings },
    { label: "Booking Terkonfirmasi", value: data.confirmed_bookings },
    { label: "Payment Menunggu", value: data.pending_payments },
    { label: "Total Kamar", value: data.total_rooms },
    { label: "Kamar Terisi", value: `${data.occupied_rooms}/${data.total_rooms}` },
  ]

  return (
   <div className="p-4 sm:p-8">
  <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-text mb-6 sm:mb-8">Laporan Bisnis</h1>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm text-text-secondary">{c.label}</p>
            <p className="font-heading font-extrabold text-2xl text-text mt-2">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}