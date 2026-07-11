import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { fadeUpVariant, staggerContainer } from "@/animations/framerVariants"
import { textReveal } from "@/animations/gsapScroll"
import { branches } from "@/lib/branches"
import { useSiteContent } from "@/hooks/useSiteContent"
import { useRooms } from "@/hooks/useRooms"

export function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const navigate = useNavigate()
  const [branch, setBranch] = useState<string>("")
  const { data: content } = useSiteContent()

  // Kamar pertama yang tersedia dipakai sebagai foto unggulan di hero.
  // Kalau belum ada foto (data kosong / gambar belum diupload), fallback ke ilustrasi denah.
  const { data: featuredData } = useRooms({ page: 1, limit: 1 })
  const featuredRoom = featuredData?.rooms?.[0]
  const featuredImage = featuredRoom?.images?.find((img) => img.is_primary) ?? featuredRoom?.images?.[0]

  // Fallback ke copy default kalau CMS belum diisi — biar hero nggak pernah kosong.
  const heroTitle = content?.hero_title || "Hunian terpilih,\ndikelola satu tangan."
  const heroSubtitle =
    content?.hero_subtitle ||
    "KostHub bukan marketplace acak — kami satu manajemen dengan standar kebersihan, keamanan, dan harga yang sama di setiap cabang: Depok, Jakarta Selatan, Tangerang, dan Cikarang."

  useEffect(() => {
    if (headingRef.current) textReveal("#hero-heading")
  }, [])

  const handleSearch = () => {
    navigate(branch ? `/rooms?branch=${branch}` : "/rooms")
  }

  return (
    <section className="relative bg-paper pt-16 pb-24 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
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
            className="font-heading font-medium text-5xl md:text-6xl text-ink leading-[1.08] tracking-tight whitespace-pre-line"
          >
            {heroTitle}
          </h1>

          <motion.p
            variants={fadeUpVariant}
            className="mt-6 text-lg text-text-secondary max-w-md leading-relaxed"
          >
            {heroSubtitle}
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

        {/* editorial photo panel — foto kamar unggulan asli, offset & layered biar nggak kaku */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:pl-6"
        >
          <div className="relative rotate-[-1.5deg]">
            <div className="rounded-md h-[380px] overflow-hidden shadow-xl shadow-ink/25 bg-primary relative">
              {featuredImage ? (
                <img
                  src={featuredImage.image_url}
                  alt={featuredRoom?.room_number ?? "Kamar unggulan"}
                  className="w-full h-full object-cover"
                />
              ) : (
                // Fallback ilustrasi denah — dipakai kalau belum ada foto kamar di database
                <svg viewBox="0 0 400 380" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                  <rect x="40" y="60" width="180" height="140" fill="none" stroke="#E7E3D6" strokeWidth="1" opacity="0.4" />
                  <rect x="230" y="60" width="120" height="140" fill="none" stroke="#E7E3D6" strokeWidth="1" opacity="0.4" />
                  <line x1="220" y1="60" x2="220" y2="200" stroke="#E7E3D6" strokeWidth="1" opacity="0.25" />
                  <circle cx="90" cy="130" r="24" fill="none" stroke="#A9873F" strokeWidth="1.5" />
                  <line x1="40" y1="240" x2="350" y2="240" stroke="#E7E3D6" strokeWidth="1" opacity="0.25" />
                </svg>
              )}
            </div>

            <div className="absolute -bottom-4 left-6 bg-card rounded-sm px-4 py-2.5 shadow-lg shadow-ink/20">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">
                {featuredRoom?.branch?.name ?? "Cabang unggulan"}
              </p>
              <p className="font-heading font-medium text-sm text-ink mt-0.5">
                {featuredRoom
                  ? `Rp${featuredRoom.price.toLocaleString("id-ID")}/bln`
                  : "Segera hadir"}
              </p>
            </div>
          </div>

          {featuredRoom && (
            <Link
              to={`/rooms/${featuredRoom.id}`}
              className="inline-block mt-8 ml-6 text-sm text-ink border-b border-ink/40 hover:border-primary hover:text-primary pb-0.5 transition-colors"
            >
              Lihat kamar ini →
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  )
}
