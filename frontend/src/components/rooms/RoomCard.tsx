import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { MapPin, Heart } from "lucide-react"
import { cardHoverVariant } from "@/animations/framerVariants"
import { useToggleFavorite } from "@/hooks/useFavorites"
import { useAuthStore } from "@/store/authStore"
import type { Room } from "@/lib/types"

export function RoomCard({ room }: { room: Room }) {
  const primaryImage = room.images?.find((img) => img.is_primary) ?? room.images?.[0]
  const toggleFavorite = useToggleFavorite()
  const token = useAuthStore((s) => s.token)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!token) return
    toggleFavorite.mutate(room.id)
  }

  return (
    <motion.div initial="rest" whileHover="hover" variants={cardHoverVariant}>
      <Link to={`/rooms/${room.id}`} className="block">
        <p className="font-mono text-2xl font-medium text-brass leading-none">{room.room_number}</p>

        <div className="relative mt-3 h-44 rounded-sm overflow-hidden bg-gradient-to-br from-primary/15 to-section">
          {primaryImage ? (
            <img src={primaryImage.image_url} alt={room.room_number} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm font-mono">
              Belum ada foto
            </div>
          )}
          <span
            className={`absolute top-3 right-3 font-mono text-[10px] uppercase tracking-wide px-2 py-1 rounded-sm ${
              room.status === "available"
                ? "bg-primary text-paper"
                : "bg-text-secondary text-paper"
            }`}
          >
            {room.status === "available" ? "Tersedia" : room.status === "booked" ? "Terisi" : "Maintenance"}
          </span>

          {token && (
            <button
              onClick={handleFavoriteClick}
              aria-label="Simpan ke favorit"
              className="absolute top-3 left-3 w-8 h-8 rounded-full bg-card/90 border border-border flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Heart size={15} className={room.is_favorited ? "fill-clay text-clay" : "text-clay"} />
            </button>
          )}
        </div>

        <div className="mt-3 border-t border-border pt-3">
          <h3 className="font-heading font-medium text-ink">
            {room.room_type?.name ?? "Kamar"}
          </h3>
          <p className="flex items-center gap-1 text-sm text-text-secondary mt-1">
            <MapPin size={14} /> {room.branch?.name ?? "-"}
          </p>
          <p className="font-mono font-semibold text-primary mt-2">
            Rp{room.price.toLocaleString("id-ID")}
            <span className="font-normal text-text-secondary text-sm"> /bulan</span>
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
