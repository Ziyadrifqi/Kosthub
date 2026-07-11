import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { useSiteContent } from "@/hooks/useSiteContent"
import { fadeUpVariant } from "@/animations/framerVariants"

export function PromoBanner() {
  const { data: content } = useSiteContent()
  const promo = content?.promo_banner?.trim()

  if (!promo) return null

  return (
    <div className="px-6 -mt-4 mb-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUpVariant}
        className="max-w-3xl mx-auto bg-brass/10 border border-brass/30 rounded-md px-5 py-3 flex items-center gap-3"
      >
        <Sparkles size={18} className="text-brass shrink-0" />
        <p className="text-sm font-heading font-medium text-ink">{promo}</p>
      </motion.div>
    </div>
  )
}
