import { motion } from "framer-motion"
import { fadeUpVariant } from "@/animations/framerVariants"

export function Testimonial() {
  return (
    <section className="py-24 px-6 bg-background">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUpVariant}
        className="max-w-2xl mx-auto text-center"
      >
        <p className="font-heading text-xl md:text-2xl text-text leading-relaxed">
          "Booking kamar cuma butuh 5 menit, dan admin fast response pas saya tanya-tanya
          soal aturan kost. Jauh lebih tenang dibanding cari kost manual keliling."
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-heading font-semibold text-primary text-sm">
            RA
          </div>
          <div className="text-left">
            <p className="font-heading font-semibold text-sm text-text">Rani A.</p>
            <p className="text-xs text-text-secondary">Penghuni Kost Jakarta Selatan</p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}