import { useState } from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { useAuditLogs } from "@/hooks/useAuditLogs"
import { usePageTitle } from "@/hooks/usePageTitle"

const LIMIT = 15

export default function OwnerAuditLog() {
  usePageTitle("Audit Log")
  const [action, setAction] = useState("")
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAuditLogs(action, page)

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  return (
    <div className="p-8">
      <h1 className="font-heading font-extrabold text-2xl text-text mb-1">Audit Log Pembayaran</h1>
      <p className="text-text-secondary mb-6">
        Riwayat lengkap verifikasi & penolakan pembayaran — siapa, kapan, dan alasannya. Data ini tidak bisa diubah.
      </p>

      <div className="flex gap-2 mb-6">
        {[
          { value: "", label: "Semua" },
          { value: "verified", label: "Disetujui" },
          { value: "rejected", label: "Ditolak" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => { setAction(f.value); setPage(1) }}
            className={`text-sm font-heading font-medium px-4 py-2 rounded-lg border transition-colors ${
              action === f.value
                ? "bg-primary text-white border-primary"
                : "border-border text-text-secondary hover:bg-section"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-text-secondary">Memuat...</p>}

      {data?.logs.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-text-secondary">
          Belum ada riwayat.
        </div>
      )}

      <div className="space-y-3">
        {data?.logs.map((log) => (
          <div key={log.id} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {log.action === "verified" ? (
                  <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={18} className="text-error shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-heading font-semibold text-sm text-text">
                    {log.action === "verified" ? "Disetujui" : "Ditolak"} oleh{" "}
                    <span className="text-primary">{log.performer?.name}</span>
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    {log.payment?.booking?.user?.name} · {log.payment?.booking?.room?.room_number} · Rp
                    {log.payment?.amount?.toLocaleString("id-ID")}
                  </p>
                  {log.note && (
                    <p className="text-sm text-text mt-2 bg-section rounded-lg px-3 py-2 italic">
                      "{log.note}"
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs text-text-secondary font-heading whitespace-nowrap">
                {new Date(log.created_at).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {data && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="font-heading font-medium text-sm border border-border rounded-lg px-4 py-2 disabled:opacity-40 hover:bg-section transition-colors"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-text-secondary">Halaman {page} dari {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="font-heading font-medium text-sm border border-border rounded-lg px-4 py-2 disabled:opacity-40 hover:bg-section transition-colors"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  )
}