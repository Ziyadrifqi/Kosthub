import type { Variants } from "framer-motion"

export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export const cardHoverVariant: Variants = {
  rest: { y: 0, scale: 1, boxShadow: "0 1px 3px rgba(17,24,39,0.08)" },
  hover: {
    y: -6,
    scale: 1.015,
    boxShadow: "0 12px 24px rgba(16,185,129,0.15)", // pakai warna primary di shadow, khas brand
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}