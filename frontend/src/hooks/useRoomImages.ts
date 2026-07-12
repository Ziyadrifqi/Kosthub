import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface RoomImage {
  id: number
  room_id: number
  image_url: string
  is_primary: boolean
}

export function useRoomImages(roomId: number | null) {
  return useQuery({
    queryKey: ["room-images", roomId],
    queryFn: async () => {
      const res = await api.get<{ images: RoomImage[] }>(`/staff/rooms/${roomId}/images`)
      return res.data.images
    },
    enabled: !!roomId,
  })
}

export function useUploadRoomImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ roomId, file }: { roomId: number; file: File }) => {
      const formData = new FormData()
      formData.append("image", file)
      const res = await api.post(`/staff/rooms/${roomId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return res.data
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ["room-images", roomId] })
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
    },
  })
}

export function useDeleteRoomImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ roomId, imageId }: { roomId: number; imageId: number }) => {
      await api.delete(`/staff/rooms/${roomId}/images/${imageId}`)
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ["room-images", roomId] })
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
    },
  })
}

export function useSetPrimaryImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ roomId, imageId }: { roomId: number; imageId: number }) => {
      await api.patch(`/staff/rooms/${roomId}/images/${imageId}/primary`)
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ["room-images", roomId] })
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
    },
  })
}