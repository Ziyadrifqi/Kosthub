import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { fadeUpVariant } from "@/animations/framerVariants"

export function CtaBanner() {
  return (
    <section className="px-6 pb-24 bg-section">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUpVariant}
        className="max-w-4xl mx-auto bg-primary rounded-md px-8 py-16 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-pegboard opacity-20 pointer-events-none" />
        <h2 className="font-heading font-medium text-3xl md:text-4xl text-paper relative">
          Siap Menemukan Kost Idealmu?
        </h2>
        <p className="text-paper/80 mt-3 relative">Daftar sekarang, gratis dan tanpa komitmen.</p>
        <Link
          to="/register"
          className="inline-block mt-7 font-heading font-medium bg-paper text-ink rounded-sm px-7 py-3 hover:bg-white transition-colors relative"
        >
          Mulai Sekarang
        </Link>
      </motion.div>
    </section>
  )
}
