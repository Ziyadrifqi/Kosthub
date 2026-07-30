import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface TenantUser {
  id: string
  name: string
  email: string
  phone?: string
}

export interface TenantProfile {
  id_number?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  occupation?: string
  staff_note?: string
}

export interface TenantBookingHistory {
  id: string
  check_in: string
  duration_months: number
  total_price: number
  status: string
  room?: { room_number: string }
}

export function useTenants(search: string, page: number) {
  return useQuery({
    queryKey: ["tenants", search, page],
    queryFn: async () => {
      const res = await api.get<{ users: TenantUser[]; total: number }>("/staff/tenants", {
        params: { search: search || undefined, page, limit: 20 },
      })
      return res.data
    },
  })
}

export function useTenantDetail(userId: string | null) {
  return useQuery({
    queryKey: ["tenant-detail", userId],
    queryFn: async () => {
      const res = await api.get<{ profile: TenantProfile | null; history: TenantBookingHistory[] }>(`/staff/tenants/${userId}`)
      return res.data
    },
    enabled: !!userId,
  })
}

export function useUpdateTenantProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, ...payload }: { userId: string } & TenantProfile) => {
      await api.put(`/staff/tenants/${userId}/profile`, payload)
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["tenant-detail", userId] })
    },
  })
}