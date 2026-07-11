import { motion } from "framer-motion"
import { fadeUpVariant } from "@/animations/framerVariants"

export function Testimonial() {
  return (
    <section className="py-24 px-6 bg-section">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUpVariant}
        className="max-w-xl mx-auto"
      >
        <div className="relative bg-card border border-border rounded-sm p-8 rotate-[-1.5deg] shadow-md">
          <span className="absolute -top-2.5 left-8 w-3 h-3 rounded-full bg-gold shadow-sm ring-2 ring-card" />
          <p className="font-heading text-xl text-ink leading-relaxed">
            "Booking kamar cuma butuh 5 menit, dan admin fast response pas saya
            tanya-tanya soal aturan kost. Jauh lebih tenang dibanding cari kost
            manual keliling."
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center font-mono text-xs text-primary">
              RA
            </div>
            <div className="text-left">
              <p className="font-heading font-medium text-sm text-ink">Rani A.</p>
              <p className="text-xs text-text-secondary font-mono">Penghuni · Jakarta Selatan</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
