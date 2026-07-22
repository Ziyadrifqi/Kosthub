import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface BankAccount {
  id: number
  bank_name: string
  account_number: string
  account_holder: string
  note?: string
  is_active: boolean
}

export function useActiveBankAccounts() {
  return useQuery({
    queryKey: ["bank-accounts-active"],
    queryFn: async () => {
      const res = await api.get<{ accounts: BankAccount[] }>("/bank-accounts")
      return res.data.accounts
    },
  })
}

export function useAllBankAccounts() {
  return useQuery({
    queryKey: ["bank-accounts-all"],
    queryFn: async () => {
      const res = await api.get<{ accounts: BankAccount[] }>("/owner/bank-accounts")
      return res.data.accounts
    },
  })
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<BankAccount, "id" | "is_active">) => {
      const res = await api.post("/owner/bank-accounts", payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts-all"] })
      queryClient.invalidateQueries({ queryKey: ["bank-accounts-active"] })
    },
  })
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number } & Omit<BankAccount, "id" | "is_active">) => {
      const res = await api.patch(`/owner/bank-accounts/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts-all"] })
      queryClient.invalidateQueries({ queryKey: ["bank-accounts-active"] })
    },
  })
}

export function useToggleBankAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/owner/bank-accounts/${id}/toggle`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts-all"] })
      queryClient.invalidateQueries({ queryKey: ["bank-accounts-active"] })
    },
  })
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/owner/bank-accounts/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bank-accounts-all"] }),
  })
}