import { useState, useRef, useEffect } from "react"
import { Bell, CheckCheck } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks/useNotifications"

const typeStyle: Record<string, string> = {
  success: "bg-primary",
  warning: "bg-brass",
  error: "bg-clay",
  info: "bg-info",
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data } = useNotifications()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const unreadCount = data?.unread_count ?? 0

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 hover:bg-section rounded-sm transition-colors">
        <Bell size={20} className="text-ink" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-clay text-paper text-[10px] font-mono font-semibold w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-md shadow-lg overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-mono text-xs uppercase tracking-wide text-text-secondary">Notifikasi</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead.mutate()}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <CheckCheck size={13} /> Tandai semua dibaca
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {data?.notifications.length === 0 && (
                <p className="text-center text-sm text-text-secondary py-8">Belum ada notifikasi.</p>
              )}
              {data?.notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead.mutate(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-section transition-colors flex gap-3 ${
                    !n.is_read ? "bg-primary/5" : ""
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${typeStyle[n.type] ?? "bg-info"}`} />
                  <div>
                    <p className="font-heading font-medium text-sm text-ink">{n.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{n.body}</p>
                    <p className="text-[11px] text-text-secondary mt-1 font-mono">
                      {new Date(n.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
