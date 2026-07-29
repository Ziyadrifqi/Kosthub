import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { fadeUpVariant } from "@/animations/framerVariants"
import { useFeaturedReviews } from "@/hooks/useTestimonials"

const fallbackReviews = [
  {
    comment:
      "KostHub bikin proses cari kost yang biasanya ribet jadi simpel banget. Verifikasi pembayarannya juga cepat dan jelas statusnya.",
    user: { name: "Dimas P." },
    room: { branch: { name: "Depok" } },
  },
]

const AUTO_SLIDE_INTERVAL = 6000

export function LargeTestimonial() {
  const { data: reviews } = useFeaturedReviews()
  const list = reviews && reviews.length > 0 ? reviews : fallbackReviews

  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (list.length <= 1) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % list.length)
    }, AUTO_SLIDE_INTERVAL)
    return () => clearInterval(timer)
  }, [list.length])

  useEffect(() => {
    setIndex(0)
  }, [list.length])

  const active = list[index]

  return (
    <section className="px-6 pb-12 bg-section">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUpVariant}
        className="max-w-4xl mx-auto bg-text rounded-3xl px-8 py-16 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <p className="font-heading font-medium text-xl md:text-2xl text-white leading-relaxed max-w-2xl mx-auto">
              "{active.comment}"
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-heading font-semibold text-white text-sm">
                {active.user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="font-heading font-semibold text-sm text-white">{active.user?.name}</p>
                <p className="text-xs text-white/60">Penghuni {active.room?.branch?.name}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {list.length > 1 && (
          <div className="relative flex items-center justify-center gap-2 mt-8">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Testimonial ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-primary" : "w-1.5 bg-white/25"
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </section>
  )
}