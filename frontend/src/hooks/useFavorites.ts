import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Room } from "@/lib/types"

export function useMyFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await api.get<{ favorites: { room_id: number; room: Room }[] }>("/favorites")
      return res.data.favorites
    },
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (roomId: number) => {
      const res = await api.post<{ is_favorited: boolean }>(`/favorites/${roomId}/toggle`)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  })
}