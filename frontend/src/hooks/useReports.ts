import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

interface ReportSummary {
  total_revenue: number
  total_bookings: number
  pending_bookings: number
  confirmed_bookings: number
  cancelled_bookings: number
  completed_bookings: number
  pending_payments: number
  total_rooms: number
  occupied_rooms: number
}

export function useReportSummary() {
  const role = useAuthStore((s) => s.user?.role?.name)
  const canAccess = role === "owner" || role === "super_admin"

  return useQuery({
    queryKey: ["report-summary"],
    queryFn: async () => {
      const res = await api.get<ReportSummary>("/owner/reports/summary")
      return res.data
    },
    enabled: canAccess, // jangan fetch sama sekali kalau bukan owner/super_admin
  })
}