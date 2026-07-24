import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { MessageCircle, X, Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import { useMyChatRoom, useChatHistory, useSetChatBranch } from "@/hooks/useChat"
import { useChatSocket } from "@/hooks/useChatSocket"
import { useBranches } from "@/hooks/useBranches"
import { formatChatTime, formatChatDateSeparator, isDifferentDay } from "@/lib/dateUtils"

export function ChatWidget() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: room } = useMyChatRoom()
  const { data: history } = useChatHistory(room?.id)
  const { messages, setMessages, connected, sendMessage } = useChatSocket(open ? room?.id ?? null : null)
  const setChatBranch = useSetChatBranch()
  const { data: branches } = useBranches()

  useEffect(() => {
    if (history) {
      setMessages(
        history.map((h) => ({
          type: "message",
          id: h.id,
          sender_id: h.sender_id,
          message: h.message,
          created_at: h.created_at,
        }))
      )
    }
  }, [history, setMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleBubbleClick = () => {
    if (!token) {
      navigate("/login")
      return
    }
    setOpen(!open)
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    sendMessage(text)
    setText("")
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && token && (
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
                <p className="font-mono text-[11px] text-paper/60">
                  {connected ? "Terhubung" : "Menghubungkan..."}
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-paper/70 hover:text-paper" aria-label="Tutup chat">
                <X size={18} />
              </button>
            </div>

            {room && !room.branch_id ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-paper">
                <p className="text-sm text-text mb-3">Pertanyaanmu untuk cabang mana?</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {branches?.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setChatBranch.mutate(b.id)}
                      disabled={setChatBranch.isPending}
                      className="text-xs font-heading font-medium border border-border rounded-full px-3 py-1.5 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-paper">
                  {messages.map((m, i) => {
                    const isMine = m.sender_id === user?.id
                    const showDateSeparator = i === 0 || isDifferentDay(messages[i - 1].created_at, m.created_at)

                    return (
                      <div key={m.id ?? i}>
                        {showDateSeparator && (
                          <div className="flex justify-center my-3">
                            <span className="text-[10px] font-mono uppercase tracking-wide text-text-secondary bg-section px-2.5 py-1 rounded-full">
                              {formatChatDateSeparator(m.created_at)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                            <div
                              className={`px-3 py-2 rounded-sm text-sm ${
                                isMine ? "bg-primary text-paper" : "bg-card border border-border text-text"
                              }`}
                            >
                              {m.message}
                            </div>
                            <span className="text-[10px] font-mono text-text-secondary mt-1 px-1">
                              {formatChatTime(m.created_at)}
                            </span>
                          </div>
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
                  <button
                    type="submit"
                    className="bg-ink hover:bg-primary text-paper rounded-sm px-3 py-2 transition-colors"
                    aria-label="Kirim pesan"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleBubbleClick}
        className="w-14 h-14 rounded-full bg-ink hover:bg-primary text-paper flex items-center justify-center shadow-lg transition-colors"
        aria-label={open ? "Tutup live chat" : "Buka live chat"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  )
}