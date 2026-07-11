import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ShieldCheck, KeyRound } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Pilih Cabang & Kamar",
    desc: "Filter berdasarkan cabang, harga, dan fasilitas. Lihat foto asli dan review penghuni sebelumnya.",
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
        <div className="mb-14">
          <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Alur</p>
          <h2 className="font-heading font-medium text-3xl md:text-4xl text-ink">
            Dari cari sampai pindah, tiga langkah
          </h2>
        </div>

        <div className="grid md:grid-cols-[1fr_1.1fr] gap-12 items-center">
          <div>
            {steps.map((step, i) => (
              <button
                key={step.title}
                onClick={() => setActive(i)}
                className={`w-full text-left py-5 border-b border-border transition-colors ${
                  active === i ? "" : "opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-brass">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-heading font-medium text-lg text-ink">{step.title}</span>
                </div>
                {active === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-sm text-text-secondary mt-2 pl-9 leading-relaxed"
                  >
                    {step.desc}
                  </motion.p>
                )}
              </button>
            ))}
          </div>

          <div className="relative bg-primary rounded-md aspect-[4/3] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col items-center text-paper"
              >
                <ActiveIcon className="w-12 h-12" strokeWidth={1.25} />
                <span className="font-mono text-[11px] uppercase tracking-widest mt-3">
                  Langkah {active + 1} dari 3
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
