import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface Building {
  id: number
  branch_id: number
  name: string
  total_floor: number
}

export interface RoomType {
  id: number
  name: string
  description: string
  base_price: number
}

export function useBuildings(branchId?: number) {
  return useQuery({
    queryKey: ["buildings", branchId],
    queryFn: async () => {
      const res = await api.get<{ buildings: Building[] }>("/buildings", {
        params: branchId ? { branch_id: branchId } : {},
      })
      return res.data.buildings
    },
    enabled: !!branchId,
  })
}

export function useRoomTypes() {
  return useQuery({
    queryKey: ["room-types"],
    queryFn: async () => {
      const res = await api.get<{ room_types: RoomType[] }>("/room-types")
      return res.data.room_types
    },
  })
}

export function useCreateBuilding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { branch_id: number; name: string; total_floor: number }) => {
      const res = await api.post("/staff/buildings", payload)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["buildings"] }),
  })
}

export function useCreateRoomType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { name: string; description: string; base_price: number }) => {
      const res = await api.post("/staff/room-types", payload)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["room-types"] }),
  })
}