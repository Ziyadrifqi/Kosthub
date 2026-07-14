import { useAuthStore } from "@/store/authStore"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface ChatRoom {
  id: string
  user_id: string
  branch_id?: number
  status: string
}

interface ChatMessageHistory {
  id: string
  sender_id: string
  message: string
  created_at: string
}

export function useMyChatRoom() {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: ["my-chat-room"],
    queryFn: async () => {
      const res = await api.get<ChatRoom>("/chat/my-room")
      return res.data
    },
    enabled: !!token, // jangan fetch sama sekali kalau belum login
  })
}

export function useChatHistory(roomId: string | undefined) {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: ["chat-history", roomId],
    queryFn: async () => {
      const res = await api.get<{ messages: ChatMessageHistory[] }>(`/chat/${roomId}/messages`)
      return res.data.messages
    },
    enabled: !!token && !!roomId,
  })
}

export function useSetChatBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (branchId: number) => {
      await api.patch("/chat/my-room/branch", { branch_id: branchId })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-chat-room"] }),
  })
}