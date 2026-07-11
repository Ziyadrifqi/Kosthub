import { Hero } from "@/components/home/Hero"
import { BranchTicker } from "@/components/home/BranchTicker"
import { HowItWorks } from "@/components/home/HowItWorks"
import { FeatureGrid } from "@/components/home/FeatureGrid"
import { Testimonial } from "@/components/home/Testimonial"
import { LargeTestimonial } from "@/components/home/LargeTestimonial"
import { CtaBanner } from "@/components/home/CtaBanner"

export default function Home() {
  return (
    <>
      <Hero />
      <BranchTicker />
      <div id="cara-kerja">
        <HowItWorks />
      </div>
      <FeatureGrid />
      <Testimonial />
      <LargeTestimonial />
      <CtaBanner />
    </>
  )
}
