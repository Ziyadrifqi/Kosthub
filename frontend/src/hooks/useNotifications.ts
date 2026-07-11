import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface AppNotification {
  id: number
  title: string
  body: string
  type: "info" | "success" | "warning" | "error"
  is_read: boolean
  created_at: string
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get<{ notifications: AppNotification[]; unread_count: number }>("/notifications")
      return res.data
    },
    refetchInterval: 30 * 1000, // polling tiap 30 detik, cukup untuk fitur ini tanpa perlu WebSocket
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => api.patch("/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })
}