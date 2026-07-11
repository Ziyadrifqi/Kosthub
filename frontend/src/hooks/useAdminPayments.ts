import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface PaymentWithBooking {
  id: string
  booking_id: string
  method: string
  proof_url?: string
  amount: number
  status: string
  created_at: string
  booking?: {
    id: string
    check_in: string
    duration_months: number
    user?: { id: string; name: string; email: string }
    room?: { id: number; room_number: string; room_type?: { name: string } }
  }
}

import { useAuthStore } from "@/store/authStore"

export function usePendingPayments() {
  const role = useAuthStore((s) => s.user?.role?.name)
  const canAccess = role === "staff" || role === "super_admin"

  return useQuery({
    queryKey: ["admin-pending-payments"],
    queryFn: async () => {
      const res = await api.get<{ payments: PaymentWithBooking[]; total: number }>("/staff/payments/pending")
      return res.data
    },
    enabled: canAccess,
  })
}

export function useVerifyPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, approve, note }: { id: string; approve: boolean; note?: string }) => {
      const res = await api.patch(`/staff/payments/${id}/verify`, { approve, note })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-payments"] })
    },
  })
}