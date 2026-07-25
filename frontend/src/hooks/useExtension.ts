import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface ExtensionRequestItem {
  id: string
  additional_months: number
  total_price: number
  status: string
  proof_url?: string
  created_at: string
  booking?: { user?: { name: string; email: string }; room?: { room_number: string } }
}

export function useCreateExtension() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { booking_id: string; additional_months: number }) => {
      const res = await api.post("/extension-requests", payload)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-bookings"] }),
  })
}

export function useUploadExtensionProof() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData()
      formData.append("proof", file)
      await api.post(`/extension-requests/${id}/upload-proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-bookings"] }),
  })
}

export function useWaitingExtensions() {
  return useQuery({
    queryKey: ["waiting-extensions"],
    queryFn: async () => {
      const res = await api.get<{ requests: ExtensionRequestItem[] }>("/staff/extension-requests")
      return res.data.requests
    },
  })
}

export function useProcessExtension() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, approve, note }: { id: string; approve: boolean; note?: string }) => {
      await api.patch(`/staff/extension-requests/${id}`, { approve, note })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["waiting-extensions"] }),
  })
}