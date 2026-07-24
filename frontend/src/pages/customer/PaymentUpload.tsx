import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { UploadCloud, CheckCircle2, Landmark, Copy } from "lucide-react"
import { useBookingDetail, useUploadProof } from "@/hooks/useBookings"
import { CountdownBadge } from "@/components/CountdownBadge"
import { useActiveBankAccounts } from "@/hooks/useBankAccounts"
import { usePageTitle } from "@/hooks/usePageTitle"

export default function PaymentUpload() {
  usePageTitle("Upload Bukti Transfer")
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { data: booking } = useBookingDetail(bookingId ?? "")
  const uploadProof = useUploadProof()
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !bookingId) return
    uploadProof.mutate(
      { bookingId, file },
      { onSuccess: () => navigate("/my-bookings") }
    )
  }
 const { data: bankAccounts } = useActiveBankAccounts()
const [copiedId, setCopiedId] = useState<number | null>(null)

const handleCopy = (id: number, number: string) => {
  navigator.clipboard.writeText(number)
  setCopiedId(id)
  setTimeout(() => setCopiedId(null), 1500)
}
  if (!booking) return null

  return (
    <section className="max-w-lg mx-auto px-6 py-14 bg-paper">
      <h1 className="font-heading font-medium text-2xl text-ink mb-1">Upload Bukti Transfer</h1>
      <p className="text-text-secondary mb-4">
        Total: <strong className="text-ink font-mono">Rp{booking.total_price.toLocaleString("id-ID")}</strong>
      </p>

      {booking.expires_at && (
        <div className="mb-6">
          <CountdownBadge expiresAt={booking.expires_at} />
        </div>
      )}

{bankAccounts && bankAccounts.length > 0 && (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      <Landmark size={15} className="text-primary" />
      <p className="font-heading font-medium text-sm text-ink">Transfer ke rekening berikut</p>
    </div>

    <div className="bg-card border border-border rounded-md overflow-hidden">
      {bankAccounts.map((acc, i) => (
        <div
          key={acc.id}
          className={`px-4 py-3.5 ${i !== bankAccounts.length - 1 ? "border-b border-border" : ""}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-wide text-text-secondary">
                {acc.bank_name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="font-mono font-semibold text-ink text-base">{acc.account_number}</p>
                <button
                  onClick={() => handleCopy(acc.id, acc.account_number)}
                  className="text-text-secondary hover:text-primary transition-colors shrink-0"
                  aria-label="Salin nomor rekening"
                >
                  <Copy size={13} />
                </button>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">a.n. {acc.account_holder}</p>
            </div>

            {copiedId === acc.id && (
              <span className="text-[10px] font-mono uppercase tracking-wide text-primary shrink-0">
                Tersalin
              </span>
            )}
          </div>
        </div>
      ))}
    </div>

    <p className="text-xs text-text-secondary mt-2 px-1">
      Transfer sesuai nominal persis, lalu upload bukti transfer di bawah.
    </p>
  </div>
)}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-md p-6 space-y-5">
        <label className="block border-2 border-dashed border-border rounded-sm p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2 text-primary">
              <CheckCircle2 size={28} />
              <span className="text-sm font-medium">{file.name}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-text-secondary">
              <UploadCloud size={28} />
              <span className="text-sm">Klik untuk pilih foto bukti transfer</span>
            </div>
          )}
        </label>

        {uploadProof.isError && (
          <p className="text-clay text-sm font-mono">Gagal upload. Coba lagi.</p>
        )}

        <button
          type="submit"
          disabled={!file || uploadProof.isPending}
          className="w-full font-heading font-medium bg-ink hover:bg-primary text-paper rounded-sm py-3 transition-colors disabled:opacity-60"
        >
          {uploadProof.isPending ? "Mengunggah..." : "Kirim Bukti Transfer"}
        </button>
      </form>
    </section>
  )
}
