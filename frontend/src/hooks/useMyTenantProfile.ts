import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface MyTenantProfile {
  id_number?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  occupation?: string
}

export function useMyTenantProfile() {
  return useQuery({
    queryKey: ["my-tenant-profile"],
    queryFn: async () => {
      const res = await api.get<{ profile: MyTenantProfile | null }>("/profile/tenant")
      return res.data.profile
    },
  })
}

export function useUpdateMyTenantProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: MyTenantProfile) => {
      await api.put("/profile/tenant", payload)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-tenant-profile"] }),
  })
}