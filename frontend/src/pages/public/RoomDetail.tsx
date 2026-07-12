import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Loader2, MapPin, CheckCircle2, Star } from "lucide-react"
import { useRoomDetail } from "@/hooks/useRooms"
import { useRoomReviews, useCreateReview } from "@/hooks/useReviews"
import { useAuthStore } from "@/store/authStore"

export default function RoomDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const { data: room, isLoading, isError } = useRoomDetail(id ?? "")
  const { data: reviewData } = useRoomReviews(Number(id))
  const createReview = useCreateReview(Number(id))

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const apiOrigin = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? ""

  const handleBooking = () => {
    if (!token) {
      navigate("/login")
      return
    }
    navigate(`/booking/${id}`)
  }

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createReview.mutate({ rating, comment }, { onSuccess: () => setComment("") })
  }

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-primary" /></div>
  }

  if (isError || !room) {
    return <p className="text-clay text-center py-24 font-mono text-sm">Kamar tidak ditemukan.</p>
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-14 bg-paper">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="h-80 bg-gradient-to-br from-primary/15 to-section rounded-md overflow-hidden">
          {room.images?.[0] ? (
  <img src={`${apiOrigin}${room.images[0].image_url}`} alt={room.room_number} className="w-full h-full object-cover" />
) : (
            <div className="w-full h-full flex items-center justify-center text-text-secondary font-mono text-sm">Belum ada foto</div>
          )}
        </div>

        <div>
          <p className="font-mono text-xs text-text-secondary tracking-widest">{room.room_number}</p>
          <h1 className="font-heading font-medium text-2xl text-ink mt-1">
            {room.room_type?.name ?? "Kamar"}
          </h1>
          <p className="flex items-center gap-1 text-text-secondary mt-2">
            <MapPin size={16} /> {room.branch?.name}, {room.branch?.city}
          </p>

          <p className="font-mono font-semibold text-3xl text-primary mt-6">
            Rp{room.price.toLocaleString("id-ID")}
            <span className="font-normal text-text-secondary text-base"> /bulan</span>
          </p>

          {room.room_type?.description && (
            <p className="text-text-secondary mt-4 leading-relaxed">{room.room_type.description}</p>
          )}

          {room.facilities && room.facilities.length > 0 && (
            <div className="mt-6">
              <h3 className="font-heading font-medium text-ink mb-2">Fasilitas</h3>
              <div className="grid grid-cols-2 gap-2">
                {room.facilities.map((f) => (
                  <span key={f.id} className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle2 size={14} className="text-primary" /> {f.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleBooking}
            disabled={room.status !== "available"}
            className="w-full mt-8 font-heading font-medium bg-ink hover:bg-primary disabled:bg-text-secondary disabled:cursor-not-allowed text-paper rounded-sm py-3 transition-colors"
          >
            {room.status === "available" ? "Booking Kamar Ini" : "Tidak Tersedia"}
          </button>
        </div>
      </div>

      {/* === Ulasan === */}
      <div className="max-w-3xl mt-16">
        <h2 className="font-heading font-medium text-xl text-ink mb-1">
          Ulasan {reviewData && <span className="font-mono text-base text-text-secondary">({reviewData.count})</span>}
        </h2>
        {reviewData && reviewData.count > 0 && (
          <p className="flex items-center gap-1 text-sm text-text-secondary mb-6 font-mono">
            <Star size={14} className="fill-warning text-warning" /> {reviewData.average.toFixed(1)} dari 5
          </p>
        )}

        {token && (
          <form onSubmit={handleReviewSubmit} className="relative bg-card border border-border rounded-md p-5 mb-6">
            <span className="absolute -top-2.5 left-6 w-3 h-3 rounded-full bg-brass shadow-sm ring-2 ring-card" />
            <p className="font-heading font-medium text-sm text-ink mb-2">Tulis Ulasan</p>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setRating(n)}>
                  <Star size={20} className={n <= rating ? "fill-warning text-warning" : "text-border"} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan pengalamanmu tinggal di sini..."
              rows={3}
              className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition"
            />
            {createReview.isError && (
              <p className="text-clay text-xs mt-2 font-mono">
                Kamu hanya bisa review kamar yang pernah kamu tempati (booking confirmed/completed).
              </p>
            )}
            <button
              type="submit"
              disabled={createReview.isPending}
              className="mt-3 font-heading font-medium text-sm bg-ink hover:bg-primary text-paper rounded-sm px-5 py-2 transition-colors disabled:opacity-60"
            >
              Kirim Ulasan
            </button>
          </form>
        )}

        <div className="space-y-4">
          {reviewData?.reviews.map((r) => (
            <div key={r.id} className="border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <span className="font-heading font-medium text-sm text-ink">{r.user?.name}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className={i < r.rating ? "fill-warning text-warning" : "text-border"} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-text-secondary mt-1">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
