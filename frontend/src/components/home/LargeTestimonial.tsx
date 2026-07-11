import { motion } from "framer-motion"
import { fadeUpVariant } from "@/animations/framerVariants"

export function LargeTestimonial() {
  return (
    <section className="px-6 pb-24 bg-section">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUpVariant}
        className="max-w-4xl mx-auto bg-ink rounded-md px-8 py-16 text-center"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-brass mb-5">Dari penghuni cabang Depok</p>
        <p className="font-heading font-medium text-xl md:text-2xl text-paper leading-relaxed max-w-2xl mx-auto">
          "KostHub bikin proses cari kost yang biasanya ribet jadi simpel banget.
          Verifikasi pembayarannya juga cepat dan jelas statusnya."
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brass/20 flex items-center justify-center font-mono font-semibold text-brass text-sm">
            DP
          </div>
          <div className="text-left">
            <p className="font-heading font-medium text-sm text-paper">Dimas P.</p>
            <p className="text-xs text-paper/50 font-mono">Mahasiswa · Cabang Depok</p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
