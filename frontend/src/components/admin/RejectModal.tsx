import { useState } from "react"
import { X } from "lucide-react"

interface Props {
  onClose: () => void
  onConfirm: (note: string) => void
  isLoading: boolean
}

export function RejectModal({ onClose, onConfirm, isLoading }: Props) {
  const [note, setNote] = useState("")

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-card rounded-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text">
          <X size={20} />
        </button>
        <h3 className="font-heading font-bold text-lg text-text mb-1">Tolak Pembayaran</h3>
        <p className="text-sm text-text-secondary mb-4">
          Wajib isi alasan penolakan — akan tercatat permanen dan ditampilkan ke user.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Contoh: Nominal transfer tidak sesuai dengan total booking"
          className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 font-heading font-medium text-sm border border-border rounded-lg py-2.5 hover:bg-section transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => note.trim() && onConfirm(note)}
            disabled={!note.trim() || isLoading}
            className="flex-1 font-heading font-medium text-sm bg-error hover:opacity-90 text-white rounded-lg py-2.5 transition-opacity disabled:opacity-50"
          >
            {isLoading ? "Memproses..." : "Tolak Pembayaran"}
          </button>
        </div>
      </div>
    </div>
  )
}