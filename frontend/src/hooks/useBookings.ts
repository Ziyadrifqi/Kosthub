import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Booking } from "@/lib/types"

export function useCreateBooking() {
  return useMutation({
    mutationFn: async (payload: { room_id: number; check_in: string; duration_months: number }) => {
      const res = await api.post<Booking>("/bookings", payload)
      return res.data
    },
  })
}

export function useMyBookings() {
  return useQuery({
    queryKey: ["my-bookings"],
    queryFn: async () => {
      const res = await api.get<{ bookings: Booking[]; total: number }>("/bookings/my")
      return res.data
    },
  })
}

export function useBookingDetail(id: string) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const res = await api.get<Booking>(`/bookings/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

export function useUploadProof() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ bookingId, file }: { bookingId: string; file: File }) => {
      const formData = new FormData()
      formData.append("booking_id", bookingId)
      formData.append("proof", file)
      const res = await api.post("/payments/upload-proof", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] })
    },
  })
}