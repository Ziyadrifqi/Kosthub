import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface Review {
  id: number
  rating: number
  comment: string
  created_at: string
  user?: { name: string }
}

export function useRoomReviews(roomId: number) {
  return useQuery({
    queryKey: ["reviews", roomId],
    queryFn: async () => {
      const res = await api.get<{ reviews: Review[]; average: number; count: number }>(`/rooms/${roomId}/reviews`)
      return res.data
    },
  })
}

export function useCreateReview(roomId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { rating: number; comment: string }) => {
      const res = await api.post("/reviews", { room_id: roomId, ...payload })
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews", roomId] }),
  })
}