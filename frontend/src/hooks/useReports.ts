import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface ReportSummary {
  total_revenue: number
  total_bookings: number
  confirmed_bookings: number
  pending_payments: number
  total_rooms: number
  occupied_rooms: number
}

export function useReportSummary() {
  return useQuery({
    queryKey: ["report-summary"],
    queryFn: async () => {
      const res = await api.get<ReportSummary>("/owner/reports/summary")
      return res.data
    },
  })
}