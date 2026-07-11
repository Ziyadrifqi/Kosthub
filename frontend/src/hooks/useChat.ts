import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface ChatRoom {
  id: string
  user_id: string
  status: string
}

interface ChatMessageHistory {
  id: string
  sender_id: string
  message: string
  created_at: string
}

export function useMyChatRoom() {
  return useQuery({
    queryKey: ["my-chat-room"],
    queryFn: async () => {
      const res = await api.get<ChatRoom>("/chat/my-room")
      return res.data
    },
  })
}

export function useChatHistory(roomId: string | undefined) {
  return useQuery({
    queryKey: ["chat-history", roomId],
    queryFn: async () => {
      const res = await api.get<{ messages: ChatMessageHistory[] }>(`/chat/${roomId}/messages`)
      return res.data.messages
    },
    enabled: !!roomId,
  })
}