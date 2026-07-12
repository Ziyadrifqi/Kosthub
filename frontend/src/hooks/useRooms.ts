import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Room, RoomListResponse } from "@/lib/types"

export interface RoomFilters {
  branch_id?: number
  status?: string
  min_price?: number
  max_price?: number
  search?: string
  page?: number
  limit?: number
}

export function useRooms(filters: RoomFilters = {}) {
  return useQuery({
    queryKey: ["rooms", filters],
    queryFn: async () => {
      const res = await api.get<RoomListResponse>("/rooms", { params: filters })
      return res.data
    },
    staleTime: 30 * 1000, // data dianggap basi setelah 30 detik, auto-refetch kalau lebih lama
  })
}

export function useRoomDetail(id: string | number) {
  return useQuery({
    queryKey: ["room", id],
    queryFn: async () => {
      const res = await api.get<Room>(`/rooms/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

