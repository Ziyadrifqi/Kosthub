import { useState } from "react"
import { X, Download } from "lucide-react"
import { api } from "@/lib/api"

const presets = [
  { label: "Bulan Ini", getRange: () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { start, end }
  }},
  { label: "3 Bulan Terakhir", getRange: () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { start, end }
  }},
  { label: "Tahun Ini", getRange: () => {
    const now = new Date()
    return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31) }
  }},
]

function toDateInput(d: Date) {
  return d.toISOString().split("T")[0]
}

export function ExportModal({ method, branchId, onClose }: { method: string; branchId?: number; onClose: () => void }) {
  const today = new Date()
  const [start, setStart] = useState(toDateInput(new Date(today.getFullYear(), today.getMonth(), 1)))
  const [end, setEnd] = useState(toDateInput(today))
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applyPreset = (getRange: () => { start: Date; end: Date }) => {
    setError(null)
    const range = getRange()
    setStart(toDateInput(range.start))
    setEnd(toDateInput(range.end))
  }

  const handleExport = async () => {
    setDownloading(true)
    setError(null)
    try {
      const res = await api.get("/owner/transactions/export", {
        params: { start, end, method: method || undefined, branch_id: branchId },
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement("a")
      link.href = url
      link.download = `transaksi_${start}_sampai_${end}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
      onClose()
    } catch (err: any) {
      // Backend balas JSON meski responseType "blob", jadi res.data-nya berupa Blob berisi JSON.
      // Perlu di-parse manual dulu untuk ambil pesan errornya.
      const blob = err?.response?.data
      if (blob instanceof Blob) {
        try {
          const text = await blob.text()
          const parsed = JSON.parse(text)
          setError(parsed.error || "Gagal export data.")
        } catch {
          setError("Gagal export data.")
        }
      } else {
        setError("Gagal export data. Coba lagi.")
      }
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-card rounded-2xl p-6 w-full max-w-sm relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text">
          <X size={20} />
        </button>
        <h3 className="font-heading font-bold text-lg text-text mb-1">Export ke Excel</h3>
        <p className="text-sm text-text-secondary mb-4">Pilih rentang tanggal, bebas berapa bulan/tahun.</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.getRange)}
              className="text-xs font-heading font-medium border border-border rounded-full px-3 py-1.5 hover:border-primary hover:text-primary transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-secondary">Dari Tanggal</label>
            <input
              type="date"
              value={start}
              onChange={(e) => { setStart(e.target.value); setError(null) }}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-text-secondary">Sampai Tanggal</label>
            <input
              type="date"
              value={end}
              onChange={(e) => { setEnd(e.target.value); setError(null) }}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm mt-1"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2 mt-3">
            {error}
          </p>
        )}

        <button
          onClick={handleExport}
          disabled={downloading}
          className="w-full mt-5 flex items-center justify-center gap-2 font-heading font-medium text-sm bg-primary text-white rounded-lg py-2.5 disabled:opacity-60"
        >
          <Download size={16} /> {downloading ? "Menyiapkan file..." : "Download Excel"}
        </button>
      </div>
    </div>
  )
}