import { useState } from "react"
import { X, UploadCloud, CheckCircle2, Wrench } from "lucide-react"
import { useCreateTicket } from "@/hooks/useMaintenance"

export function MaintenanceModal({ roomId, roomNumber, onClose }: { roomId: number; roomNumber: string; onClose: () => void }) {
  const [description, setDescription] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const createTicket = useCreateTicket()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createTicket.mutate(
      { roomId, description, photo: photo ?? undefined },
      { onSuccess: onClose }
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-card rounded-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text">
          <X size={20} />
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Wrench size={18} className="text-primary" />
          <h3 className="font-heading font-bold text-lg text-text">Lapor Kerusakan</h3>
        </div>
        <p className="text-sm text-text-secondary mb-4">Kamar {roomNumber}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            placeholder="Jelaskan kerusakan/masalahnya..."
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm resize-none"
          />

          <label className="block border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
            {photo ? (
              <div className="flex flex-col items-center gap-1.5 text-primary">
                <CheckCircle2 size={20} />
                <span className="text-xs font-medium">{photo.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-text-secondary">
                <UploadCloud size={20} />
                <span className="text-xs">Foto kerusakan (opsional)</span>
              </div>
            )}
          </label>

          {createTicket.isError && (
            <p className="text-error text-xs">Gagal mengirim laporan. Coba lagi.</p>
          )}

          <button
            type="submit"
            disabled={createTicket.isPending}
            className="w-full font-heading font-medium text-sm bg-primary text-white rounded-lg py-2.5 disabled:opacity-60"
          >
            {createTicket.isPending ? "Mengirim..." : "Kirim Laporan"}
          </button>
        </form>
      </div>
    </div>
  )
}