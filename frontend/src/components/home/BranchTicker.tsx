import { useEffect } from "react"
import { velocityScroll } from "@/animations/gsapScroll"
import { branches } from "@/lib/branches"

export function BranchTicker() {
  useEffect(() => {
    velocityScroll("#branch-ticker")
  }, [])

  const items = [...branches, ...branches]

  return (
    <div className="bg-ink py-4 overflow-hidden">
      <div id="branch-ticker" className="flex gap-12 whitespace-nowrap font-mono text-xs uppercase tracking-widest text-paper/70">
        {items.map((b, i) => (
          <span key={`${b.code}-${i}`} className="flex items-center gap-2.5">
            <span className="w-1 h-1 rounded-full bg-brass" /> Cabang {b.name}
          </span>
        ))}
      </div>
    </div>
  )
}
