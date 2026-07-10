import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { fadeUpVariant, staggerContainer } from "@/animations/framerVariants"
import { textReveal } from "@/animations/gsapScroll"

export function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (headingRef.current) textReveal("#hero-heading")
  }, [])

  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-24 px-6">
      {/* ambient glow — signature warna brand, bukan generic gradient */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative max-w-4xl mx-auto text-center"
      >
        <motion.span
          variants={fadeUpVariant}
          className="inline-block font-heading font-semibold text-sm text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6"
        >
          Dipercaya 500+ penyewa aktif
        </motion.span>

        <h1
          id="hero-heading"
          ref={headingRef}
          className="font-heading font-extrabold text-4xl md:text-6xl text-text leading-tight tracking-tight"
        >
          Cari Kost Nyaman,
          <br />
          <span className="text-primary">Booking</span> dalam Hitungan Menit
        </h1>

        <motion.p
          variants={fadeUpVariant}
          className="mt-6 text-lg text-text-secondary max-w-xl mx-auto"
        >
          Ribuan kamar kost terverifikasi, transparan soal harga, dan proses booking
          yang aman — semua dalam satu platform.
        </motion.p>

        <motion.div variants={fadeUpVariant} className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/rooms"
            className="font-heading font-medium bg-primary hover:bg-primary-hover text-white rounded-lg px-6 py-3 transition-colors shadow-sm shadow-primary/30"
          >
            Cari Kost Sekarang
          </Link>
          <Link
            to="/register"
            className="font-heading font-medium border border-border text-text rounded-lg px-6 py-3 hover:bg-section transition-colors"
          >
            Daftar Gratis
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}