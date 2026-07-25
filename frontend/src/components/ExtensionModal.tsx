import { useState } from "react"
import { X, UploadCloud, CheckCircle2 } from "lucide-react"
import { useCreateExtension, useUploadExtensionProof } from "@/hooks/useExtension"
import type { Booking } from "@/lib/types"

export function ExtensionModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const [months, setMonths] = useState(1)
  const [step, setStep] = useState<"form" | "upload" | "done">("form")
  const [extensionId, setExtensionId] = useState<string | null>(null)
  const [totalPrice, setTotalPrice] = useState(0)
  const [file, setFile] = useState<File | null>(null)

  const createExtension = useCreateExtension()
  const uploadProof = useUploadExtensionProof()

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createExtension.mutate(
      { booking_id: booking.id, additional_months: months },
      {
        onSuccess: (data) => {
          setExtensionId(data.id)
          setTotalPrice(data.total_price)
          setStep("upload")
        },
      }
    )
  }

  const handleUpload = () => {
    if (!file || !extensionId) return
    uploadProof.mutate({ id: extensionId, file }, { onSuccess: () => setStep("done") })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-card rounded-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text">
          <X size={20} />
        </button>

        {step === "form" && (
          <>
            <h3 className="font-heading font-bold text-lg text-text mb-1">Perpanjang Masa Sewa</h3>
            <p className="text-sm text-text-secondary mb-4">
              Kamar {booking.room?.room_number} · Perpanjangan dihitung mulai sehari setelah masa sewa saat ini berakhir.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Tambah berapa bulan?</label>
                <input
                  type="number"
                  min={1}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
                />
              </div>

              {createExtension.isError && (
                <p className="text-error text-xs">Gagal mengajukan. Coba lagi.</p>
              )}

              <button
                type="submit"
                disabled={createExtension.isPending}
                className="w-full font-heading font-medium text-sm bg-primary text-white rounded-lg py-2.5 disabled:opacity-60"
              >
                {createExtension.isPending ? "Memproses..." : "Ajukan Perpanjangan"}
              </button>
            </form>
          </>
        )}

        {step === "upload" && (
          <>
            <h3 className="font-heading font-bold text-lg text-text mb-1">Upload Bukti Transfer</h3>
            <p className="text-sm text-text-secondary mb-4">
              Total: <strong className="text-text">Rp{totalPrice.toLocaleString("id-ID")}</strong>
            </p>

            <label className="block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              {file ? (
                <div className="flex flex-col items-center gap-2 text-primary">
                  <CheckCircle2 size={24} />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-text-secondary">
                  <UploadCloud size={24} />
                  <span className="text-sm">Klik untuk pilih foto bukti transfer</span>
                </div>
              )}
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || uploadProof.isPending}
              className="w-full font-heading font-medium text-sm bg-primary text-white rounded-lg py-2.5 disabled:opacity-60"
            >
              {uploadProof.isPending ? "Mengunggah..." : "Kirim Bukti Transfer"}
            </button>
          </>
        )}

        {step === "done" && (
          <div className="text-center py-6">
            <CheckCircle2 className="mx-auto text-primary mb-3" size={32} />
            <p className="font-heading font-semibold text-text mb-1">Pengajuan Terkirim</p>
            <p className="text-sm text-text-secondary mb-4">Menunggu verifikasi admin, biasanya diproses dalam beberapa jam.</p>
            <button onClick={onClose} className="font-heading font-medium text-sm bg-primary text-white rounded-lg px-6 py-2.5">
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  )
}