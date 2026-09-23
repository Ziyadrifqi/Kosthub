import { useState } from "react"
import { Wrench, Image as ImageIcon } from "lucide-react"
import { useBranchTickets, useUpdateTicketStatus } from "@/hooks/useMaintenance"
import { usePageTitle } from "@/hooks/usePageTitle"

const apiOrigin = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? ""

const tabs = [
  { value: "open", label: "Menunggu" },
  { value: "in_progress", label: "Ditangani" },
  { value: "resolved", label: "Selesai" },
]

export default function StaffMaintenance() {
  usePageTitle("Laporan Kerusakan")

  const [status, setStatus] = useState("open")
  const { data: tickets } = useBranchTickets(status)
  const updateStatus = useUpdateTicketStatus()

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-1">
        <Wrench size={20} className="text-primary" />
        <h1 className="font-heading font-extrabold text-2xl text-text">Laporan Kerusakan</h1>
      </div>
      <p className="text-text-secondary mb-6">Kelola laporan kerusakan dari customer di cabangmu.</p>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={`text-sm font-heading font-medium px-4 py-2 rounded-lg border transition-colors ${
              status === t.value ? "bg-primary text-white border-primary" : "border-border text-text-secondary hover:bg-section"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {tickets?.map((t) => (
          <div key={t.id} className="bg-card border border-border rounded-2xl p-5 flex gap-4">
            <div className="w-20 h-20 rounded-lg bg-section shrink-0 overflow-hidden flex items-center justify-center">
              {t.photo_url ? (
                <a href={`${apiOrigin}${t.photo_url}`} target="_blank" rel="noreferrer">
                  <img src={`${apiOrigin}${t.photo_url}`} alt="" className="w-full h-full object-cover" />
                </a>
              ) : (
                <ImageIcon className="text-text-secondary" size={18} />
              )}
            </div>

            <div className="flex-1">
              <p className="font-heading font-semibold text-text">
                {t.room?.room_number} · {t.room?.branch?.name}
              </p>
              <p className="text-sm text-text-secondary mt-1">Dilapor oleh {t.reporter?.name}</p>
              <p className="text-sm text-text mt-2">{t.description}</p>
              <p className="text-xs text-text-secondary mt-2">
                {new Date(t.created_at).toLocaleString("id-ID")}
              </p>
            </div>

            <div className="shrink-0">
              <select
                value={t.status}
                onChange={(e) => updateStatus.mutate({ id: t.id, status: e.target.value })}
                className="border border-border rounded-lg px-3 py-2 text-sm"
              >
                <option value="open">Menunggu</option>
                <option value="in_progress">Sedang Ditangani</option>
                <option value="resolved">Selesai</option>
              </select>
            </div>
          </div>
        ))}

        {tickets?.length === 0 && (
          <div className="text-center text-text-secondary py-12 bg-card border border-border rounded-2xl">
            Tidak ada laporan di kategori ini.
          </div>
        )}
      </div>
    </div>
  )
}