import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import { useMyChatRoom, useChatHistory } from "@/hooks/useChat"
import { useChatSocket } from "@/hooks/useChatSocket"

export function ChatWidget() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const { data: room } = useMyChatRoom()
  const { data: history } = useChatHistory(room?.id)
  const { messages, setMessages, connected, sendMessage } = useChatSocket(open ? room?.id ?? null : null)

  useEffect(() => {
    if (history) {
      setMessages(history.map((h) => ({ type: "message", id: h.id, sender_id: h.sender_id, message: h.message, created_at: h.created_at })))
    }
  }, [history, setMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!token) return null

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    sendMessage(text)
    setText("")
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="w-80 h-96 bg-card border border-border rounded-md shadow-lg mb-3 flex flex-col overflow-hidden"
          >
            <div className="bg-ink px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-heading font-medium text-paper text-sm">Live Chat Admin</p>
                <p className="font-mono text-[11px] text-paper/60">{connected ? "Terhubung" : "Menghubungkan..."}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-paper/70 hover:text-paper" aria-label="Tutup chat">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-paper">
              {messages.map((m, i) => {
                const isMine = m.sender_id === user?.id
                return (
                  <div key={m.id ?? i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-sm text-sm ${
                        isMine ? "bg-primary text-paper" : "bg-card border border-border text-text"
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="border-t border-border p-3 flex gap-2 bg-card">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tulis pesan..."
                className="flex-1 border border-border rounded-sm px-3 py-2 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button type="submit" className="bg-ink hover:bg-primary text-paper rounded-sm px-3 py-2 transition-colors" aria-label="Kirim pesan">
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-ink hover:bg-primary text-paper flex items-center justify-center shadow-lg transition-colors"
        aria-label={open ? "Tutup live chat" : "Buka live chat"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  )
}
