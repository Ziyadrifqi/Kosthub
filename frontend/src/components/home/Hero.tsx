import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { fadeUpVariant, staggerContainer } from "@/animations/framerVariants"
import { textReveal } from "@/animations/gsapScroll"
import { branches } from "@/lib/branches"

export function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const navigate = useNavigate()
  const [branch, setBranch] = useState<string>("")

  useEffect(() => {
    if (headingRef.current) textReveal("#hero-heading")
  }, [])

  const handleSearch = () => {
    navigate(branch ? `/rooms?branch=${branch}` : "/rooms")
  }

  return (
    <section className="relative bg-paper pt-16 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-end">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.p
            variants={fadeUpVariant}
            className="font-mono text-xs uppercase tracking-widest text-primary mb-5"
          >
            Direktori Hunian &middot; 4 Cabang, Satu Standar
          </motion.p>

          <h1
            id="hero-heading"
            ref={headingRef}
            className="font-heading font-medium text-5xl md:text-6xl text-ink leading-[1.08] tracking-tight"
          >
            Hunian terpilih,
            <br />
            dikelola satu tangan.
          </h1>

          <motion.p
            variants={fadeUpVariant}
            className="mt-6 text-lg text-text-secondary max-w-md leading-relaxed"
          >
            KostHub bukan marketplace acak — kami satu manajemen dengan standar
            kebersihan, keamanan, dan harga yang sama di setiap cabang: Depok,
            Jakarta Selatan, Tangerang, dan Cikarang.
          </motion.p>

          <motion.div variants={fadeUpVariant} className="mt-8 bg-card border border-border rounded-md p-2 flex flex-col sm:flex-row gap-2 max-w-lg">
            <div className="relative flex-1">
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full appearance-none bg-transparent px-4 py-3 text-sm font-mono text-ink focus:outline-none"
              >
                <option value="">Semua cabang</option>
                {branches.map((b) => (
                  <option key={b.code} value={b.code}>{b.name}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            </div>
            <button
              onClick={handleSearch}
              className="font-heading font-medium bg-ink hover:bg-primary text-paper rounded-sm px-6 py-3 transition-colors"
            >
              Cari Kamar
            </button>
          </motion.div>

          <motion.div variants={fadeUpVariant} className="mt-8 flex items-center gap-5 font-mono text-xs text-text-secondary uppercase tracking-wide">
            <span>5 lokasi</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>1 manajemen</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>Sejak 2021</span>
          </motion.div>
        </motion.div>

        {/* editorial photo panel — masthead spread */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="bg-primary rounded-md h-[380px] flex items-end p-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-paper/70">Cabang unggulan</p>
              <p className="font-heading font-medium text-2xl text-paper mt-1">Jakarta Selatan</p>
              <Link to="/rooms?branch=JKS" className="inline-block mt-3 text-sm text-paper/90 border-b border-paper/40 hover:border-paper pb-0.5 transition-colors">
                Lihat kamar tersedia →
              </Link>
            </div>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary mt-3">
            Fig. 01 — Ruang tamu bersama, Cabang Jakarta Selatan
          </p>
        </motion.div>
      </div>
    </section>
  )
}
