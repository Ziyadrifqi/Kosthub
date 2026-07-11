import { motion } from "framer-motion"
import { useSiteContent } from "@/hooks/useSiteContent"
import { fadeUpVariant } from "@/animations/framerVariants"

export function PromoBanner() {
  const { data: content } = useSiteContent()
  const promo = content?.promo_banner?.trim()

  if (!promo) return null

  return (
    <div className="px-6 -mt-4 mb-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUpVariant}
        className="max-w-xl mx-auto relative"
      >
        <div className="bg-primary rounded-md py-3.5 pl-14 pr-5 shadow-lg shadow-ink/20">
          <p className="font-heading text-sm text-paper">{promo}</p>
        </div>
        <span className="absolute left-[-10px] top-1/2 -translate-y-1/2 -rotate-[8deg] bg-brass text-ink font-mono text-[11px] font-medium px-3 py-2 rounded-sm shadow-lg shadow-ink/25">
          PROMO
        </span>
      </motion.div>
    </div>
  )
}
