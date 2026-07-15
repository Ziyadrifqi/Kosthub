import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface AuditLog {
  id: string
  action: "verified" | "rejected"
  note?: string
  ip_address?: string
  created_at: string
  performer?: { name: string; email: string }
  payment?: {
    amount: number
    booking?: {
      user?: { name: string; email: string }
      room?: { room_number: string }
    }
  }
}

export function useAuditLogs(action: string, page: number) {
  return useQuery({
    queryKey: ["audit-logs", action, page],
    queryFn: async () => {
      const res = await api.get<{ logs: AuditLog[]; total: number }>("/owner/audit-logs", {
        params: { action: action || undefined, page, limit: 15 },
      })
      return res.data
    },
  })
}