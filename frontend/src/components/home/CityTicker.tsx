import { useEffect } from "react"
import { velocityScroll } from "@/animations/gsapScroll"

const cities = ["Jakarta Selatan", "Bandung", "Yogyakarta", "Surabaya", "Depok", "Malang", "Semarang", "Bekasi"]

export function CityTicker() {
  useEffect(() => {
    velocityScroll("#city-ticker")
  }, [])

  return (
    <div className="bg-section py-6 overflow-hidden border-y border-border">
      <div id="city-ticker" className="flex gap-10 whitespace-nowrap font-heading font-semibold text-text-secondary text-sm">
        {[...cities, ...cities].map((city, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {city}
          </span>
        ))}
      </div>
    </div>
  )
}