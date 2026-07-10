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
    <section className="py-24 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="font-heading font-semibold text-sm text-secondary">Alur Sederhana</span>
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-text mt-2">
            Dari Cari Sampai Pindah, 3 Langkah Saja
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-3">
            {steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-full text-left p-5 rounded-xl border transition-all ${
                  active === i
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <span className="font-heading font-semibold text-text block mb-1">
                  {String(i + 1).padStart(2, "0")}. {step.title}
                </span>
                {active === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-sm text-text-secondary mt-2"
                  >
                    {step.desc}
                  </motion.p>
                )}
              </button>
            ))}
          </div>

          <div className="relative bg-section rounded-2xl aspect-square flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotate: 4 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-28 h-28 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
              >
                <ActiveIcon className="w-14 h-14 text-white" strokeWidth={1.5} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}