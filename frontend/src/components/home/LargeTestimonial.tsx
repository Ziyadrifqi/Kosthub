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
        className="max-w-4xl mx-auto bg-ink rounded-md px-8 py-16 text-center relative overflow-hidden bg-pegboard"
      >
        <span className="font-mono text-xs uppercase tracking-widest text-gold/80">Dari Buku Tamu</span>
        <p className="relative font-heading font-medium text-xl md:text-2xl text-paper leading-relaxed max-w-2xl mx-auto mt-5">
          "KostHub bikin proses cari kost yang biasanya ribet jadi simpel banget.
          Verifikasi pembayarannya juga cepat dan jelas statusnya."
        </p>
        <div className="relative mt-7 flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center font-mono font-semibold text-gold text-sm">
            DP
          </div>
          <div className="text-left">
            <p className="font-heading font-medium text-sm text-paper">Dimas P.</p>
            <p className="text-xs text-paper/50 font-mono">Mahasiswa · Yogyakarta</p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
