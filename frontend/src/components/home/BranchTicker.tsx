import { useEffect } from "react"
import { infiniteMarquee } from "@/animations/gsapScroll"
import { useBranches } from "@/hooks/useBranches"

export function BranchTicker() {
  const { data: branches } = useBranches()

  useEffect(() => {
    if (branches && branches.length > 0) infiniteMarquee("#branch-ticker", 50, "left")
  }, [branches])

  if (!branches || branches.length === 0) return null

  const items = [...branches, ...branches]

  return (
    <div className="bg-ink py-4 overflow-hidden">
      <div id="branch-ticker" className="flex gap-12 whitespace-nowrap font-mono text-xs uppercase tracking-widest text-paper/70">
        {items.map((b, i) => (
          <span key={`${b.id}-${i}`} className="flex items-center gap-2.5">
            <span className="w-1 h-1 rounded-full bg-brass" /> Cabang {b.name}
          </span>
        ))}
      </div>
    </div>
  )
}