import { useEffect } from "react"
import { velocityScroll } from "@/animations/gsapScroll"

const cities = ["Jakarta Selatan", "Bandung", "Yogyakarta", "Surabaya", "Depok", "Malang", "Semarang", "Bekasi"]

export function CityTicker() {
  useEffect(() => {
    velocityScroll("#city-ticker")
  }, [])

  return (
    <div className="relative bg-ink py-5 overflow-hidden">
      {/* torn paper edges top & bottom, like a pinned strip */}
      <div className="absolute inset-x-0 top-0 h-1 bg-[repeating-linear-gradient(90deg,transparent,transparent_6px,rgba(242,238,227,0.15)_6px,rgba(242,238,227,0.15)_8px)]" />

      <div id="city-ticker" className="flex gap-12 whitespace-nowrap font-mono text-xs uppercase tracking-widest text-paper/70">
        {[...cities, ...cities].map((city, i) => (
          <span key={i} className="flex items-center gap-2.5">
            <span className="w-1 h-1 rounded-full bg-gold" /> Kost tersedia di {city}
          </span>
        ))}
      </div>
    </div>
  )
}
