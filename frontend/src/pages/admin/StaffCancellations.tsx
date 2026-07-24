import { CheckCircle2, XCircle } from "lucide-react"
import { usePendingCancellations, useProcessCancellation } from "@/hooks/useCancellation"
import { usePageTitle } from "@/hooks/usePageTitle"

export default function StaffCancellations() {
  usePageTitle("Pembatalan")
  const { data } = usePendingCancellations()
  const process = useProcessCancellation()

  return (
    <div className="p-8">
      <h1 className="font-heading font-extrabold text-2xl text-text mb-1">Pengajuan Pembatalan</h1>
      <p className="text-text-secondary mb-8">Tinjau pengajuan cancel/pindah dari customer.</p>

      {data?.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-text-secondary">
          Tidak ada pengajuan menunggu.
        </div>
      )}

      <div className="space-y-4">
        {data?.map((req) => (
          <div key={req.id} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-heading font-semibold text-text">{req.user?.name}</p>
                <p className="text-sm text-text-secondary">
                  Kamar {req.booking?.room?.room_number} · {req.type === "full_cancel" ? "Batal Penuh" : "Pindah di Tengah Sewa"}
                </p>
                <p className="text-sm text-text mt-2 bg-section rounded-lg px-3 py-2 italic">"{req.reason}"</p>
                <p className="font-heading font-bold text-primary mt-2">
                  Refund: Rp{req.refund_amount.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => process.mutate({ id: req.id, approve: true })}
                  className="flex items-center gap-2 font-heading font-medium text-sm bg-primary text-white rounded-lg px-4 py-2"
                >
                  <CheckCircle2 size={16} /> Setujui
                </button>
                <button
                  onClick={() => {
                    const note = prompt("Alasan penolakan:")
                    if (note) process.mutate({ id: req.id, approve: false, note })
                  }}
                  className="flex items-center gap-2 font-heading font-medium text-sm border border-error text-error rounded-lg px-4 py-2"
                >
                  <XCircle size={16} /> Tolak
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}