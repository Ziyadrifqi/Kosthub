import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import { cardHoverVariant } from "@/animations/framerVariants"
import type { Room } from "@/lib/types"

export function RoomCard({ room }: { room: Room }) {
  const primaryImage = room.images?.find((img) => img.is_primary) ?? room.images?.[0]

  return (
    <motion.div initial="rest" whileHover="hover" variants={cardHoverVariant}>
      <Link to={`/rooms/${room.id}`} className="block bg-card border border-border rounded-2xl overflow-hidden">
        <div className="h-44 bg-gradient-to-br from-primary/15 to-secondary/15 relative">
          {primaryImage ? (
            <img src={primaryImage.image_url} alt={room.room_number} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">
              Belum ada foto
            </div>
          )}
          <span
            className={`absolute top-3 right-3 text-xs font-heading font-semibold px-2.5 py-1 rounded-full ${
              room.status === "available"
                ? "bg-primary text-white"
                : "bg-text-secondary text-white"
            }`}
          >
            {room.status === "available" ? "Tersedia" : room.status === "booked" ? "Terisi" : "Maintenance"}
          </span>
        </div>

        <div className="p-4">
          <h3 className="font-heading font-semibold text-text">
            {room.room_type?.name ?? "Kamar"} · {room.room_number}
          </h3>
          <p className="flex items-center gap-1 text-sm text-text-secondary mt-1">
            <MapPin size={14} /> {room.branch?.name ?? "-"}
          </p>
          <p className="font-heading font-bold text-primary mt-3">
            Rp{room.price.toLocaleString("id-ID")}
            <span className="font-normal text-text-secondary text-sm"> /bulan</span>
          </p>
        </div>
      </Link>
    </motion.div>
  )
}