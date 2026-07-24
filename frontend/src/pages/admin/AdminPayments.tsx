import { useState } from "react"
import { CheckCircle2, XCircle, ImageOff } from "lucide-react"
import { usePendingPayments, useVerifyPayment } from "@/hooks/useAdminPayments"
import { RejectModal } from "@/components/admin/RejectModal"
import { usePageTitle } from "@/hooks/usePageTitle"

export default function AdminPayments() {
  usePageTitle("Verifikasi Pembayaran")
  const { data, isLoading } = usePendingPayments()
  const verifyPayment = useVerifyPayment()
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const handleApprove = (id: string) => {
    verifyPayment.mutate({ id, approve: true })
  }

  const handleReject = (id: string, note: string) => {
    verifyPayment.mutate(
      { id, approve: false, note },
      { onSuccess: () => setRejectingId(null) }
    )
  }

  const apiOrigin = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? ""

  return (
    <div className="p-4 sm:p-8">
  <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-text mb-1">Verifikasi Pembayaran</h1>
  <p className="text-text-secondary mb-6 sm:mb-8">
    {data ? `${data.total} pembayaran menunggu verifikasi` : "Memuat..."}
  </p>

  {isLoading && <p className="text-text-secondary">Memuat data...</p>}

  {data?.payments.length === 0 && (
    <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center text-text-secondary">
      Tidak ada pembayaran yang perlu diverifikasi saat ini.
    </div>
  )}

  <div className="grid gap-4">
    {data?.payments.map((p) => (
      <div key={p.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row gap-4 sm:gap-5">
        <div className="w-full h-40 sm:w-28 sm:h-28 rounded-lg bg-section shrink-0 overflow-hidden flex items-center justify-center">
          {p.proof_url ? (
            <a href={`${apiOrigin}${p.proof_url}`} target="_blank" rel="noreferrer" className="w-full h-full">
              <img src={`${apiOrigin}${p.proof_url}`} alt="Bukti transfer" className="w-full h-full object-cover" />
            </a>
          ) : (
            <ImageOff className="text-text-secondary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-text break-words">
            {p.booking?.user?.name} <span className="text-text-secondary font-normal">· {p.booking?.user?.email}</span>
          </p>
          <p className="text-sm text-text-secondary mt-1">
            {p.booking?.room?.room_type?.name} · {p.booking?.room?.room_number} — {p.booking?.duration_months} bulan
          </p>
          <p className="font-heading font-bold text-primary mt-2">
            Rp{p.amount.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Diupload: {new Date(p.created_at).toLocaleString("id-ID")}
          </p>
        </div>

        <div className="flex flex-row sm:flex-col gap-2 shrink-0">
          <button
            onClick={() => handleApprove(p.id)}
            disabled={verifyPayment.isPending}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 font-heading font-medium text-sm bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 transition-colors disabled:opacity-60"
          >
            <CheckCircle2 size={16} /> Setujui
          </button>
          <button
            onClick={() => setRejectingId(p.id)}
            disabled={verifyPayment.isPending}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 font-heading font-medium text-sm border border-error text-error hover:bg-error/10 rounded-lg px-4 py-2 transition-colors disabled:opacity-60"
          >
            <XCircle size={16} /> Tolak
          </button>
        </div>
      </div>
    ))}
  </div>

  {rejectingId && (
    <RejectModal
      onClose={() => setRejectingId(null)}
      onConfirm={(note) => handleReject(rejectingId, note)}
      isLoading={verifyPayment.isPending}
    />
  )}
</div>
  )
}