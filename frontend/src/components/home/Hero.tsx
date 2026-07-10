import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Play, Star } from "lucide-react"
import { fadeUpVariant, staggerContainer } from "@/animations/framerVariants"
import { textReveal } from "@/animations/gsapScroll"

export function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (headingRef.current) textReveal("#hero-heading")
  }, [])

  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-10 px-6">
      {/* dua blob gradient — signature ambient, khas warna brand, bukan generic */}
      <div className="absolute top-[-15%] left-1/3 w-[500px] h-[500px] bg-primary/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[5%] right-[5%] w-[350px] h-[350px] bg-secondary/15 blur-[110px] rounded-full pointer-events-none" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative max-w-3xl mx-auto text-center"
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
          Cari Kost Nyaman,{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Booking
          </span>{" "}
          dalam Hitungan Menit
        </h1>

        <motion.p variants={fadeUpVariant} className="mt-6 text-lg text-text-secondary max-w-xl mx-auto">
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

      {/* mockup visual pengganti video modal — kartu preview kamar melayang */}
      <motion.div
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        className="relative max-w-4xl mx-auto mt-16"
      >
        <div className="relative bg-card border border-border rounded-2xl shadow-xl shadow-primary/5 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-error/60" />
            <span className="w-3 h-3 rounded-full bg-warning/60" />
            <span className="w-3 h-3 rounded-full bg-success/60" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border">
                <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20" />
                <div className="p-3">
                  <p className="font-heading font-semibold text-sm text-text">Kost Nyaman {i}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                    <span className="text-xs text-text-secondary">4.{i + 5} · Rp1.{i}jt/bln</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-text text-white font-heading font-medium text-sm px-5 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform">
          <Play size={14} className="fill-white" /> Lihat Cara Kerja
        </button>
      </motion.div>
    </section>
  )
}