import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { Send, MessageCircle } from "lucide-react"
import { api } from "@/lib/api"
import { useChatHistory } from "@/hooks/useChat"
import { useChatSocket } from "@/hooks/useChatSocket"
import { useAuthStore } from "@/store/authStore"
import { formatChatTime, formatChatDateSeparator, isDifferentDay } from "@/lib/dateUtils"
import { useQueryClient } from "@tanstack/react-query"

interface ChatRoomListItem {
  id: string
  user?: { id: string; name: string; email: string }
  branch?: { name: string }
  unread_count: number
  created_at: string
}

export default function AdminChat() {
  const user = useAuthStore((s) => s.user)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [text, setText] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data } = useQuery({
    queryKey: ["staff-chat-rooms"],
    queryFn: async () => {
      const res = await api.get<{ rooms: ChatRoomListItem[] }>("/staff/chat/rooms")
      return res.data.rooms
    },
    refetchInterval: 15 * 1000, // polling supaya chat baru masuk otomatis muncul di list
  })

  const { data: history } = useChatHistory(selectedRoomId ?? undefined)
  const { messages, setMessages, sendMessage } = useChatSocket(selectedRoomId)

  useEffect(() => {
    if (history) {
      setMessages(history.map((h) => ({ type: "message", id: h.id, sender_id: h.sender_id, message: h.message, created_at: h.created_at })))
    }
  }, [history, setMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    sendMessage(text)
    setText("")
  }

  const selectedRoom = data?.find((r) => r.id === selectedRoomId)
  const queryClient = useQueryClient()

const handleSelectRoom = (roomId: string) => {
  setSelectedRoomId(roomId)
  // begitu dibuka, backend otomatis mark as read (lewat GetMessages) —
  // refresh list supaya badge unread langsung hilang, bukan nunggu polling
  setTimeout(() => queryClient.invalidateQueries({ queryKey: ["staff-chat-rooms"] }), 500)
}

  return (
    <div className="flex h-[calc(100vh-0px)]">
      <div className="w-72 border-r border-border overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h1 className="font-heading font-bold text-text">Live Chat</h1>
          <p className="text-xs text-text-secondary mt-0.5">{data?.length ?? 0} percakapan aktif</p>
        </div>

        {data?.length === 0 && (
          <p className="text-center text-text-secondary text-sm py-10 px-4">Belum ada chat masuk dari cabangmu.</p>
        )}

        {data?.map((room) => (
  <button
    key={room.id}
    onClick={() => handleSelectRoom(room.id)}
    className={`w-full text-left px-4 py-3 border-b border-border hover:bg-section transition-colors flex items-center justify-between gap-2 ${
      selectedRoomId === room.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
    }`}
  >
    <div className="min-w-0">
      <p className="font-heading font-medium text-sm text-text truncate">{room.user?.name}</p>
      <p className="text-xs text-text-secondary truncate">{room.user?.email}</p>
    </div>
    {room.unread_count > 0 && (
      <span className="shrink-0 bg-error text-white text-[10px] font-heading font-bold w-5 h-5 rounded-full flex items-center justify-center">
        {room.unread_count > 9 ? "9+" : room.unread_count}
      </span>
    )}
  </button>
))}
      </div>

      <div className="flex-1 flex flex-col">
        {!selectedRoomId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-text-secondary">
            <MessageCircle size={32} className="mb-2 opacity-40" />
            <p className="text-sm">Pilih percakapan untuk mulai membalas</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-border">
              <p className="font-heading font-semibold text-text">{selectedRoom?.user?.name}</p>
              <p className="text-xs text-text-secondary">{selectedRoom?.user?.email}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
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
          <div className={`max-w-[60%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
            <div className={`px-3 py-2 rounded-2xl text-sm ${
              isMine ? "bg-primary text-white rounded-br-sm" : "bg-section text-text rounded-bl-sm"
            }`}>
              {m.message}
            </div>
            <span className="text-[10px] text-text-secondary mt-1 px-1">{formatChatTime(m.created_at)}</span>
          </div>
        </div>
      </div>
    )
  })}
  <div ref={bottomRef} />
</div>

            <form onSubmit={handleSend} className="border-t border-border p-4 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Balas pesan..."
                className="flex-1 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button type="submit" className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2.5 transition-colors">
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}