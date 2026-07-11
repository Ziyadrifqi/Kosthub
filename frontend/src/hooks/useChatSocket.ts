import { useEffect, useRef, useState, useCallback } from "react"
import { useAuthStore } from "@/store/authStore"

interface ChatMessage {
  type: string
  id: string
  sender_id: string
  message: string
  created_at: string
}

export function useChatSocket(roomId: string | null) {
  const token = useAuthStore((s) => s.token)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!roomId || !token) return

    const wsUrl = `${import.meta.env.VITE_WS_URL}/chat?token=${token}&room_id=${roomId}`
    const socket = new WebSocket(wsUrl)
    wsRef.current = socket

    socket.onopen = () => setConnected(true)
    socket.onclose = () => setConnected(false)
    socket.onmessage = (event) => {
      const data: ChatMessage = JSON.parse(event.data)
      setMessages((prev) => [...prev, data])
    }

    return () => socket.close()
  }, [roomId, token])

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: text }))
    }
  }, [])

  return { messages, setMessages, connected, sendMessage }
}