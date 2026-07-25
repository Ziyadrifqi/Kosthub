import { CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react"
import { useWaitingExtensions, useProcessExtension } from "@/hooks/useExtension"
import { usePageTitle } from "@/hooks/usePageTitle"

const apiOrigin = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? ""

export default function StaffExtensions() {
  usePageTitle("Perpanjangan Sewa")

  const { data } = useWaitingExtensions()
  const process = useProcessExtension()

  return (
    <div className="p-8">
      <h1 className="font-heading font-extrabold text-2xl text-text mb-1">Perpanjangan Sewa</h1>
      <p className="text-text-secondary mb-8">Verifikasi pembayaran perpanjangan masa sewa.</p>

      {data?.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-text-secondary">
          Tidak ada pengajuan menunggu.
        </div>
      )}

      <div className="space-y-4">
        {data?.map((ext) => (
          <div key={ext.id} className="bg-card border border-border rounded-2xl p-5 flex gap-5">
            <div className="w-24 h-24 rounded-lg bg-section shrink-0 overflow-hidden flex items-center justify-center">
              {ext.proof_url ? (
                <a href={`${apiOrigin}${ext.proof_url}`} target="_blank" rel="noreferrer">
                  <img src={`${apiOrigin}${ext.proof_url}`} alt="" className="w-full h-full object-cover" />
                </a>
              ) : (
                <ImageIcon className="text-text-secondary" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-heading font-semibold text-text">{ext.booking?.user?.name}</p>
              <p className="text-sm text-text-secondary">
                Kamar {ext.booking?.room?.room_number} · +{ext.additional_months} bulan
              </p>
              <p className="font-heading font-bold text-primary mt-2">Rp{ext.total_price.toLocaleString("id-ID")}</p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => process.mutate({ id: ext.id, approve: true })}
                className="flex items-center gap-2 font-heading font-medium text-sm bg-primary text-white rounded-lg px-4 py-2"
              >
                <CheckCircle2 size={16} /> Setujui
              </button>
              <button
                onClick={() => {
                  const note = prompt("Alasan penolakan:")
                  if (note) process.mutate({ id: ext.id, approve: false, note })
                }}
                className="flex items-center gap-2 font-heading font-medium text-sm border border-error text-error rounded-lg px-4 py-2"
              >
                <XCircle size={16} /> Tolak
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}