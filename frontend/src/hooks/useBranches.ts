import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface Branch {
  id: number
  name: string
  city: string
  address?: string
}

export function useBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const res = await api.get<{ branches: Branch[] }>("/branches")
      return res.data.branches
    },
    staleTime: 5 * 60 * 1000, // cabang jarang berubah, cache 5 menit cukup
  })
}

export function useCreateBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { name: string; city: string; address: string }) => {
      const res = await api.post("/super-admin/branches", payload)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branches"] }),
  })
}

export function useUpdateBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number; name: string; city: string; address: string }) => {
      const res = await api.patch(`/super-admin/branches/${id}`, payload)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branches"] }),
  })
}

export function useDeleteBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/super-admin/branches/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branches"] }),
  })
}