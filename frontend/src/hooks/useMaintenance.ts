import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface MaintenanceTicket {
  id: number
  description: string
  photo_url?: string
  status: string
  created_at: string
  resolved_at?: string
  room?: { room_number: string; branch?: { name: string } }
  reporter?: { name: string; email: string }
}

export function useMyTickets() {
  return useQuery({
    queryKey: ["my-maintenance-tickets"],
    queryFn: async () => {
      const res = await api.get<{ tickets: MaintenanceTicket[] }>("/maintenance-tickets/my")
      return res.data.tickets
    },
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ roomId, description, photo }: { roomId: number; description: string; photo?: File }) => {
      const formData = new FormData()
      formData.append("room_id", String(roomId))
      formData.append("description", description)
      if (photo) formData.append("photo", photo)
      await api.post("/maintenance-tickets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-maintenance-tickets"] }),
  })
}

export function useBranchTickets(status: string) {
  return useQuery({
    queryKey: ["branch-maintenance-tickets", status],
    queryFn: async () => {
      const res = await api.get<{ tickets: MaintenanceTicket[] }>("/staff/maintenance-tickets", {
        params: { status: status || undefined },
      })
      return res.data.tickets
    },
  })
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.patch(`/staff/maintenance-tickets/${id}`, { status })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branch-maintenance-tickets"] }),
  })
}