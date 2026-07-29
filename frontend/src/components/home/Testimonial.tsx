import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { fadeUpVariant } from "@/animations/framerVariants"
import { useFeaturedReviews } from "@/hooks/useTestimonials"

const fallbackReviews = [
  {
    comment:
      "Booking kamar cuma butuh 5 menit, dan admin fast response pas saya tanya-tanya soal aturan kost. Jauh lebih tenang dibanding cari kost manual keliling.",
    user: { name: "Rani A." },
    room: { branch: { name: "Jakarta Selatan" } },
  },
]

const AUTO_SLIDE_INTERVAL = 6000

export function Testimonial() {
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

  // reset index kalau jumlah data berubah (misal awalnya fallback, lalu data asli masuk)
  useEffect(() => {
    setIndex(0)
  }, [list.length])

  const active = list[index]

  return (
    <section className="py-24 px-6 bg-background">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUpVariant}
        className="max-w-2xl mx-auto text-center"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-heading text-xl md:text-2xl text-text leading-relaxed">
              "{active.comment}"
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-heading font-semibold text-primary text-sm">
                {active.user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="font-heading font-semibold text-sm text-text">{active.user?.name}</p>
                <p className="text-xs text-text-secondary">
                  Penghuni {active.room?.branch?.name}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {list.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Testimonial ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-primary" : "w-1.5 bg-primary/25"
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </section>
  )
}