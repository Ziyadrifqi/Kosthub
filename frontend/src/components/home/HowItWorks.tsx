import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ShieldCheck, KeyRound } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Cari & Bandingkan",
    desc: "Filter kamar berdasarkan lokasi, harga, dan fasilitas. Lihat foto asli dan review penghuni sebelumnya.",
  },
  {
    icon: ShieldCheck,
    title: "Booking & Bayar Aman",
    desc: "Booking langsung dari aplikasi, upload bukti transfer, diverifikasi tim kami dalam hitungan jam.",
  },
  {
    icon: KeyRound,
    title: "Pindah & Tinggal Nyaman",
    desc: "Dapat konfirmasi, koordinasi jadwal check-in, dan akses live chat kapan saja butuh bantuan.",
  },
]

export function HowItWorks() {
  const [active, setActive] = useState(0)
  const ActiveIcon = steps[active].icon

  return (
    <section className="py-24 px-6 bg-paper">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">Buku Tamu</span>
          <h2 className="font-heading font-medium text-3xl md:text-4xl text-ink mt-3">
            Dari Cari Sampai Pindah, 3 Cap Saja
          </h2>
        </div>

        <div className="grid md:grid-cols-[1fr_1.1fr] gap-12 items-center">
          <div className="space-y-1">
            {steps.map((step, i) => (
              <button
                key={step.title}
                onClick={() => setActive(i)}
                className={`w-full text-left p-5 border-b border-border transition-colors ${
                  active === i ? "bg-card" : "hover:bg-card/50"
                }`}
              >
                <div className="flex items-baseline gap-3">
                  <span className={`font-mono text-xs ${active === i ? "text-primary" : "text-text-secondary"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-heading font-medium text-ink">{step.title}</span>
                </div>
                {active === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-sm text-text-secondary mt-2 pl-7 leading-relaxed"
                  >
                    {step.desc}
                  </motion.p>
                )}
              </button>
            ))}
          </div>

          {/* the "stamp" panel */}
          <div className="relative bg-ink rounded-md aspect-square flex items-center justify-center overflow-hidden bg-pegboard">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 1.3, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: -8 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-40 h-40 rounded-full border-4 border-gold flex flex-col items-center justify-center text-gold"
              >
                <ActiveIcon className="w-12 h-12" strokeWidth={1.25} />
                <span className="font-mono text-[10px] uppercase tracking-widest mt-2">
                  Langkah {active + 1}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
