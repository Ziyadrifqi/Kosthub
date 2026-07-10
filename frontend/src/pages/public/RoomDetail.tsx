import { useParams, useNavigate } from "react-router-dom"
import { Loader2, MapPin, CheckCircle2 } from "lucide-react"
import { useRoomDetail } from "@/hooks/useRooms"
import { useAuthStore } from "@/store/authStore"

export default function RoomDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const { data: room, isLoading, isError } = useRoomDetail(id ?? "")

  const handleBooking = () => {
    if (!token) {
      navigate("/login")
      return
    }
    navigate(`/booking/${id}`)
  }

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin" /></div>
  }

  if (isError || !room) {
    return <p className="text-error text-center py-24">Kamar tidak ditemukan.</p>
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-14">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="h-80 bg-gradient-to-br from-primary/15 to-secondary/15 rounded-2xl overflow-hidden">
          {room.images?.[0] ? (
            <img src={room.images[0].image_url} alt={room.room_number} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-secondary">Belum ada foto</div>
          )}
        </div>

        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text">
            {room.room_type?.name ?? "Kamar"} · {room.room_number}
          </h1>
          <p className="flex items-center gap-1 text-text-secondary mt-2">
            <MapPin size={16} /> {room.branch?.name}, {room.branch?.city}
          </p>

          <p className="font-heading font-bold text-3xl text-primary mt-6">
            Rp{room.price.toLocaleString("id-ID")}
            <span className="font-normal text-text-secondary text-base"> /bulan</span>
          </p>

          {room.room_type?.description && (
            <p className="text-text-secondary mt-4">{room.room_type.description}</p>
          )}

          {room.facilities && room.facilities.length > 0 && (
            <div className="mt-6">
              <h3 className="font-heading font-semibold text-text mb-2">Fasilitas</h3>
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
            className="w-full mt-8 font-heading font-medium bg-primary hover:bg-primary-hover disabled:bg-text-secondary disabled:cursor-not-allowed text-white rounded-lg py-3 transition-colors"
          >
            {room.status === "available" ? "Booking Kamar Ini" : "Tidak Tersedia"}
          </button>
        </div>
      </div>
    </section>
  )
}