import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface ReviewItem {
  id: number
  rating: number
  comment: string
  created_at: string
  is_featured: boolean
  user?: { name: string }
  room?: { room_number: string; branch?: { name: string; city: string } }
}

export function useFeaturedReviews() {
  return useQuery({
    queryKey: ["featured-reviews"],
    queryFn: async () => {
      const res = await api.get<{ reviews: ReviewItem[] }>("/reviews/featured")
      return res.data.reviews
    },
  })
}

export function useAdminReviews(page: number) {
  return useQuery({
    queryKey: ["admin-reviews", page],
    queryFn: async () => {
      const res = await api.get<{ reviews: ReviewItem[]; total: number }>("/super-admin/reviews", {
        params: { page, limit: 20 },
      })
      return res.data
    },
  })
}

export function useToggleFeatured() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/super-admin/reviews/${id}/featured`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] })
      queryClient.invalidateQueries({ queryKey: ["featured-reviews"] })
    },
  })
}