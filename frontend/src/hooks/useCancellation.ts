import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface CancellationRequestItem {
  id: string
  type: string
  reason: string
  refund_amount: number
  status: string
  created_at: string
  user?: { name: string; email: string }
  booking?: { total_price: number; room?: { room_number: string } }
}

export function useCreateCancellation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { booking_id: string; type: string; reason: string }) => {
      const res = await api.post("/cancellation-requests", payload)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-bookings"] }),
  })
}

export function usePendingCancellations() {
  return useQuery({
    queryKey: ["pending-cancellations"],
    queryFn: async () => {
      const res = await api.get<{ requests: CancellationRequestItem[] }>("/staff/cancellation-requests")
      return res.data.requests
    },
  })
}

export function useProcessCancellation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, approve, note }: { id: string; approve: boolean; note?: string }) => {
      await api.patch(`/staff/cancellation-requests/${id}`, { approve, note })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pending-cancellations"] }),
  })
}