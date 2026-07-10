import { motion } from "framer-motion"
import { fadeUpVariant } from "@/animations/framerVariants"

export function LargeTestimonial() {
  return (
    <section className="px-6 pb-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUpVariant}
        className="max-w-4xl mx-auto bg-text rounded-3xl px-8 py-16 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <p className="relative font-heading font-medium text-xl md:text-2xl text-white leading-relaxed max-w-2xl mx-auto">
          "KostHub bikin proses cari kost yang biasanya ribet jadi simpel banget.
          Verifikasi pembayarannya juga cepat dan jelas statusnya."
        </p>
        <div className="relative mt-6 flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-heading font-semibold text-white text-sm">
            DP
          </div>
          <div className="text-left">
            <p className="font-heading font-semibold text-sm text-white">Dimas P.</p>
            <p className="text-xs text-white/60">Mahasiswa, Yogyakarta</p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}