import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export function useSiteContent() {
  return useQuery({
    queryKey: ["site-contents"],
    queryFn: async () => {
      const res = await api.get<Record<string, string>>("/site-contents")
      return res.data
    },
    staleTime: 5 * 60 * 1000, // cache 5 menit, konten jarang berubah tiap detik
  })
}