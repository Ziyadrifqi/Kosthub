import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { UploadCloud, CheckCircle2 } from "lucide-react"
import { useBookingDetail, useUploadProof } from "@/hooks/useBookings"
import { CountdownBadge } from "@/components/CountdownBadge"

export default function PaymentUpload() {
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

  if (!booking) return null

  return (
    <section className="max-w-lg mx-auto px-6 py-14">
      <h1 className="font-heading font-extrabold text-2xl text-text mb-1">Upload Bukti Transfer</h1>
      <p className="text-text-secondary mb-4">
        Total: <strong className="text-text">Rp{booking.total_price.toLocaleString("id-ID")}</strong>
      </p>

      {booking.expires_at && (
        <div className="mb-6">
          <CountdownBadge expiresAt={booking.expires_at} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <label className="block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
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
          <p className="text-error text-sm">Gagal upload. Coba lagi.</p>
        )}

        <button
          type="submit"
          disabled={!file || uploadProof.isPending}
          className="w-full font-heading font-medium bg-primary hover:bg-primary-hover text-white rounded-lg py-3 transition-colors disabled:opacity-60"
        >
          {uploadProof.isPending ? "Mengunggah..." : "Kirim Bukti Transfer"}
        </button>
      </form>
    </section>
  )
}