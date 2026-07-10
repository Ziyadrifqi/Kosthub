import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

/**
 * Velocity scroll — elemen bergerak lebih cepat/lambat mengikuti kecepatan scroll.
 * Cocok dipakai untuk marquee/ticker (misal: daftar kota kost yang tersedia).
 */
export function velocityScroll(selector: string, baseSpeed = 1) {
  const el = document.querySelector(selector)
  if (!el) return

  let proxy = { skew: 0 }
  let clamp = gsap.utils.clamp(-15, 15)

  ScrollTrigger.create({
    trigger: el,
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      let skew = clamp(self.getVelocity() / -300)
      if (Math.abs(skew) > Math.abs(proxy.skew)) {
        proxy.skew = skew
        gsap.to(proxy, {
          skew: 0,
          duration: 0.8,
          ease: "power3",
          overwrite: true,
          onUpdate: () => {
            gsap.set(el, { skewX: proxy.skew, x: `+=${self.getVelocity() / -1000 * baseSpeed}` })
          },
        })
      }
    },
  })
}

/**
 * Overlapping sticky sections — section berikutnya "menutupi" section sebelumnya
 * saat di-scroll, memberi efek depth/layering premium.
 */
export function stickyOverlap(sectionSelector: string) {
  const sections = gsap.utils.toArray<HTMLElement>(sectionSelector)

  sections.forEach((section, i) => {
    if (i === sections.length - 1) return

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      pin: true,
      pinSpacing: false,
      end: () => `+=${sections[i + 1].offsetHeight}`,
    })
  })
}

/**
 * Text reveal — heading muncul per-baris/kata dari bawah dengan fade.
 * Butuh SplitText (GSAP plugin premium) atau split manual di komponen.
 */
export function textReveal(selector: string) {
  const el = document.querySelector(selector)
  if (!el) return

  gsap.fromTo(
    el,
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "power4.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
      },
    }
  )
}

/**
 * Fade up — animasi masuk standar untuk card/section saat scroll ke viewport.
 */
export function fadeUp(selector: string, stagger = 0.1) {
  gsap.fromTo(
    selector,
    { y: 30, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
      stagger,
      scrollTrigger: {
        trigger: selector,
        start: "top 85%",
      },
    }
  )
}