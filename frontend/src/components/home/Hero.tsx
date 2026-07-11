import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { KeyRound } from "lucide-react"
import { fadeUpVariant, staggerContainer } from "@/animations/framerVariants"
import { textReveal } from "@/animations/gsapScroll"

const pinnedRooms = [
  { code: "A-104", type: "Kamar Single", price: "1.2jt", verified: true, rotate: -6 },
  { code: "B-207", type: "Kamar Double", price: "1.8jt", verified: true, rotate: 4 },
  { code: "C-311", type: "Kamar Studio", price: "2.1jt", verified: false, rotate: -3 },
]

export function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (headingRef.current) textReveal("#hero-heading")
  }, [])

  return (
    <section className="relative overflow-hidden bg-paper pt-16 pb-24 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
        {/* Left: the pitch */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.span
            variants={fadeUpVariant}
            className="inline-flex items-center gap-2 font-mono text-xs tracking-wide uppercase text-primary bg-primary/10 px-3 py-1.5 rounded-sm border border-primary/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            500+ penyewa aktif · terverifikasi manual
          </motion.span>

          <h1
            id="hero-heading"
            ref={headingRef}
            className="font-heading font-medium text-5xl md:text-6xl text-ink leading-[1.05] tracking-tight mt-6"
          >
            Cari kost itu <em className="not-italic text-primary">nggak</em> harus
            keliling seharian.
          </h1>

          <motion.p
            variants={fadeUpVariant}
            className="mt-6 text-lg text-text-secondary max-w-lg leading-relaxed"
          >
            Setiap kamar di KostHub sudah dicek langsung sama tim kami, harganya
            jujur dari awal, dan kamu bisa booking dari HP — tanpa harus ketemu
            calo atau nunggu balesan chat berhari-hari.
          </motion.p>

          <motion.div variants={fadeUpVariant} className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/rooms"
              className="font-heading font-medium bg-ink hover:bg-primary text-paper rounded-sm px-7 py-3.5 transition-colors"
            >
              Cari Kost Sekarang
            </Link>
            <Link
              to="/register"
              className="font-heading font-medium text-ink border-b-2 border-ink/30 hover:border-primary hover:text-primary pb-1 transition-colors"
            >
              Daftar gratis →
            </Link>
          </motion.div>

          <motion.div variants={fadeUpVariant} className="mt-10 flex items-center gap-6 text-sm text-text-secondary font-mono">
            <span>2.400+ kamar</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>32 kota</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>4.8/5 rating</span>
          </motion.div>
        </motion.div>

        {/* Right: the pegboard — signature element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-ink rounded-md p-8 md:p-10 bg-pegboard bg-pegboard shadow-2xl shadow-ink/20 min-h-[420px]"
        >
          <div className="flex flex-col gap-6 items-center">
            {pinnedRooms.map((room, i) => (
              <div
                key={room.code}
                style={{ transform: `rotate(${room.rotate}deg)` }}
                className={`relative bg-card rounded-md p-4 w-full max-w-[260px] shadow-lg ${
                  i === 1 ? "self-end" : i === 2 ? "self-start" : ""
                }`}
              >
                {/* punched hole + pin */}
                <div className="absolute -top-2 left-6 w-3 h-3 rounded-full bg-paper border border-border" />
                <div className="absolute -top-3 left-[26px] w-2 h-2 rounded-full bg-gold shadow-sm" />

                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs text-text-secondary tracking-wider">{room.code}</p>
                    <p className="font-heading font-medium text-ink mt-0.5">{room.type}</p>
                  </div>
                  <KeyRound size={16} className="text-border shrink-0 mt-1" />
                </div>

                <div className="flex items-end justify-between mt-4">
                  <p className="font-mono font-semibold text-primary text-sm">
                    Rp{room.price}<span className="text-text-secondary font-normal">/bln</span>
                  </p>
                  {room.verified && (
                    <span
                      className="font-mono text-[9px] uppercase tracking-wider text-rust border border-rust/50 rounded-sm px-1.5 py-0.5 rotate-[-8deg]"
                    >
                      Terverifikasi
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
