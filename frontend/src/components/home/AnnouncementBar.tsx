import { X } from "lucide-react"
import { useState } from "react"
import { useSiteContent } from "@/hooks/useSiteContent"

export function AnnouncementBar() {
  const { data: content } = useSiteContent()
  const [dismissed, setDismissed] = useState(false)
  const announcement = content?.announcement?.trim()

  if (!announcement || dismissed) return null

  return (
    <div className="bg-ink text-paper text-sm px-6 py-2.5 flex items-center justify-center gap-3 relative">
      <span className="font-heading font-medium text-center">{announcement}</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 hover:opacity-70 transition-opacity"
        aria-label="Tutup pengumuman"
      >
        <X size={16} />
      </button>
    </div>
  )
}
