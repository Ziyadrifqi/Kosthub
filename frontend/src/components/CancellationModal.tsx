import { useState } from "react"
import { X, AlertTriangle } from "lucide-react"
import { useCreateCancellation } from "@/hooks/useCancellation"
import type { Booking } from "@/lib/types"

export function CancellationModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const [type, setType] = useState<"full_cancel" | "early_termination">("full_cancel")
  const [reason, setReason] = useState("")
  const createCancellation = useCreateCancellation()

  // estimasi kasar di sisi client — angka final tetap dihitung ulang & divalidasi di backend
  const estimateRefund = () => {
    if (type === "full_cancel") return booking.total_price * 0.85

    const checkIn = new Date(booking.check_in)
    const endDate = new Date(checkIn)
    endDate.setMonth(endDate.getMonth() + booking.duration_months)
    const totalDays = (endDate.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    const elapsedDays = Math.max(0, Math.min(totalDays, (Date.now() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
    const remainingDays = totalDays - elapsedDays
    const dailyRate = booking.total_price / totalDays
    return remainingDays * dailyRate * 0.7
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createCancellation.mutate(
      { booking_id: booking.id, type, reason },
      { onSuccess: onClose }
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-card rounded-2xl p-6 w-full max-w-md relative max-h-[85vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text">
          <X size={20} />
        </button>
        <h3 className="font-heading font-bold text-lg text-text mb-1">Ajukan Pembatalan</h3>
        <p className="text-sm text-text-secondary mb-4">
          Kamar {booking.room?.room_number} · Pengajuan akan ditinjau admin sebelum diproses.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-start gap-2 border border-border rounded-lg p-3 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input type="radio" name="type" checked={type === "full_cancel"} onChange={() => setType("full_cancel")} className="mt-1" />
              <div>
                <p className="text-sm font-heading font-medium text-text">Batal sepenuhnya (belum pindah)</p>
                <p className="text-xs text-text-secondary">Refund 85% dari total pembayaran.</p>
              </div>
            </label>
            <label className="flex items-start gap-2 border border-border rounded-lg p-3 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input type="radio" name="type" checked={type === "early_termination"} onChange={() => setType("early_termination")} className="mt-1" />
              <div>
                <p className="text-sm font-heading font-medium text-text">Pindah di tengah masa sewa</p>
                <p className="text-xs text-text-secondary">Refund sisa hari, dipotong 30% biaya admin.</p>
              </div>
            </label>
          </div>

          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-text">
              Estimasi refund: <strong>Rp{Math.round(estimateRefund()).toLocaleString("id-ID")}</strong> — angka final akan dikonfirmasi admin.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Alasan pembatalan</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm resize-none"
              placeholder="Ceritakan alasanmu..."
            />
          </div>

          {createCancellation.isError && (
            <p className="text-error text-xs">Gagal mengajukan. Coba lagi.</p>
          )}

          <button
            type="submit"
            disabled={createCancellation.isPending}
            className="w-full font-heading font-medium text-sm bg-error hover:opacity-90 text-white rounded-lg py-2.5 disabled:opacity-60"
          >
            {createCancellation.isPending ? "Mengirim..." : "Ajukan Pembatalan"}
          </button>
        </form>
      </div>
    </div>
  )
}