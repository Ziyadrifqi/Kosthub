import { useState } from "react"
import { Star, CheckCircle2, Circle } from "lucide-react"
import { useAdminReviews, useToggleFeatured } from "@/hooks/useTestimonials"
import { usePageTitle } from "@/hooks/usePageTitle"

const LIMIT = 20

export default function SuperAdminTestimonials() {
  usePageTitle("Kelola Testimonial")

  const [page, setPage] = useState(1)
  const { data } = useAdminReviews(page)
  const toggleFeatured = useToggleFeatured()

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  return (
    <div className="p-8">
      <h1 className="font-heading font-extrabold text-2xl text-text mb-1">Kelola Testimonial</h1>
      <p className="text-text-secondary mb-8">
        Pilih ulasan mana yang layak ditampilkan sebagai testimonial di halaman utama. Maksimal 6 yang ditampilkan.
      </p>

      <div className="space-y-3">
        {data?.reviews.map((r) => (
          <div key={r.id} className={`bg-card border rounded-2xl p-5 ${r.is_featured ? "border-primary" : "border-border"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-semibold text-sm text-text">{r.user?.name}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < r.rating ? "fill-warning text-warning" : "text-border"} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  {r.room?.room_number} · {r.room?.branch?.name}
                </p>
                <p className="text-sm text-text mt-2">{r.comment}</p>
              </div>

              <button
                onClick={() => toggleFeatured.mutate(r.id)}
                className={`flex items-center gap-1.5 text-xs font-heading font-medium px-3 py-2 rounded-lg shrink-0 transition-colors ${
                  r.is_featured
                    ? "bg-primary text-white"
                    : "border border-border text-text-secondary hover:bg-section"
                }`}
              >
                {r.is_featured ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                {r.is_featured ? "Ditampilkan" : "Tampilkan"}
              </button>
            </div>
          </div>
        ))}

        {data?.reviews.length === 0 && (
          <div className="text-center text-text-secondary py-12 bg-card border border-border rounded-2xl">
            Belum ada ulasan dari customer.
          </div>
        )}
      </div>

      {data && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="font-heading font-medium text-sm border border-border rounded-lg px-4 py-2 disabled:opacity-40">Sebelumnya</button>
          <span className="text-sm text-text-secondary">Halaman {page} dari {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="font-heading font-medium text-sm border border-border rounded-lg px-4 py-2 disabled:opacity-40">Berikutnya</button>
        </div>
      )}
    </div>
  )
}