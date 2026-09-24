import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface Facility {
  id: number
  name: string
  icon: string
}

export function useFacilities() {
  return useQuery({
    queryKey: ["facilities"],
    queryFn: async () => {
      const res = await api.get<{ facilities: Facility[] }>("/facilities")
      return res.data.facilities
    },
  })
}

export function useCreateFacility() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { name: string; icon: string }) => {
      const res = await api.post("/super-admin/facilities", payload)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["facilities"] }),
  })
}

export function useDeleteFacility() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/super-admin/facilities/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["facilities"] }),
  })
}

export function useSetRoomFacilities() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ roomId, facilityIds }: { roomId: number; facilityIds: number[] }) => {
      await api.put(`/staff/rooms/${roomId}/facilities`, { facility_ids: facilityIds })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms"] }),
  })
}