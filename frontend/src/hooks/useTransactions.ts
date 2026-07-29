import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface TransactionItem {
  id: string
  method: string
  amount: number
  updated_at: string
  booking?: {
    user?: { name: string }
    room?: { room_number: string; branch?: { name: string } }
  }
}

export function useTransactions(method: string, branchId: number | undefined, page: number) {
  return useQuery({
    queryKey: ["transactions", method, branchId, page],
    queryFn: async () => {
      const res = await api.get<{ payments: TransactionItem[]; total: number; sum_total: number }>("/owner/transactions", {
        params: { method: method || undefined, branch_id: branchId, page, limit: 20 },
      })
      return res.data
    },
  })
}