import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface Building {
  id: number
  branch_id: number
  branch?: { id: number; name: string; city: string }
  name: string
  total_floor: number
  room_count: number
}

export interface RoomType {
  id: number
  name: string
  description: string
  base_price: number
}

export function useBuildings(branchId?: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["buildings", branchId ?? "all"],
    queryFn: async () => {
      const res = await api.get<{ buildings: Building[] }>("/buildings", {
        params: branchId ? { branch_id: branchId } : {},
      })
      return res.data.buildings
    },
    enabled: options?.enabled ?? true, // default: tetap fetch meski branchId kosong (artinya "semua cabang")
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
      const res = await api.post("/super-admin/buildings", payload)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["buildings"] }),
  })
}
export function useUpdateBuilding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name, total_floor }: { id: number; name: string; total_floor: number }) => {
      const res = await api.patch(`/super-admin/buildings/${id}`, { name, total_floor })
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["buildings"] }),
  })
}

export function useDeleteBuilding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/super-admin/buildings/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["buildings"] }),
  })
}
export function useCreateRoomType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { name: string; description: string; base_price: number }) => {
      const res = await api.post("/super-admin/room-types", payload)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["room-types"] }),
  })
}

export function useUpdateRoomType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name, description, base_price }: { id: number; name: string; description: string; base_price: number }) => {
      const res = await api.patch(`/super-admin/room-types/${id}`, { name, description, base_price })
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["room-types"] }),
  })
}

export function useDeleteRoomType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/super-admin/room-types/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["room-types"] }),
  })
}