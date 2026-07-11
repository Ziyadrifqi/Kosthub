import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import { cardHoverVariant } from "@/animations/framerVariants"
import type { Room } from "@/lib/types"

export function RoomCard({ room }: { room: Room }) {
  const primaryImage = room.images?.find((img) => img.is_primary) ?? room.images?.[0]

  return (
    <motion.div initial="rest" whileHover="hover" variants={cardHoverVariant} className="relative">
      {/* the punched hole + loop — key tag signature */}
      <div className="absolute -top-2.5 left-6 z-10 w-4 h-4 rounded-full bg-paper border-2 border-border" />

      <Link
        to={`/rooms/${room.id}`}
        className="block bg-card border border-border rounded-md overflow-hidden pt-3"
      >
        <div className="h-44 mx-3 rounded-sm overflow-hidden bg-gradient-to-br from-primary/15 to-section relative">
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
        </div>

        <div className="p-4">
          <p className="font-mono text-[11px] text-text-secondary tracking-widest">{room.room_number}</p>
          <h3 className="font-heading font-medium text-ink mt-0.5">
            {room.room_type?.name ?? "Kamar"}
          </h3>
          <p className="flex items-center gap-1 text-sm text-text-secondary mt-1">
            <MapPin size={14} /> {room.branch?.name ?? "-"}
          </p>
          <p className="font-mono font-semibold text-primary mt-3">
            Rp{room.price.toLocaleString("id-ID")}
            <span className="font-normal text-text-secondary text-sm"> /bulan</span>
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
