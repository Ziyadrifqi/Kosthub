import { useQuery } from "@tanstack/react-query"
import { CalendarClock } from "lucide-react"
import { api } from "@/lib/api"

interface EndingBooking {
  id: string
  check_in: string
  duration_months: number
  user?: { name: string }
  room?: { room_number: string; branch?: { name: string } }
}

export default function EndingSoon() {
  const { data } = useQuery({
    queryKey: ["ending-soon"],
    queryFn: async () => {
      const res = await api.get<{ bookings: EndingBooking[] }>("/staff/bookings/ending-soon", { params: { days: 30 } })
      return res.data.bookings
    },
  })

  const getEndDate = (b: EndingBooking) => {
    const end = new Date(b.check_in)
    end.setMonth(end.getMonth() + b.duration_months)
    return end
  }

  const daysLeft = (endDate: Date) => Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="p-8">
      <h1 className="font-heading font-extrabold text-2xl text-text mb-1">Kamar Akan Kosong</h1>
      <p className="text-text-secondary mb-8">
        Masa sewa yang akan berakhir dalam 30 hari ke depan — siapkan foto & iklan sebelum kamar kosong.
      </p>

      {data?.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-text-secondary">
          Tidak ada kamar yang akan kosong dalam 30 hari ke depan.
        </div>
      )}

      <div className="space-y-3">
        {data?.map((b) => {
          const end = getEndDate(b)
          const left = daysLeft(end)
          return (
            <div key={b.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <CalendarClock size={18} className="text-warning" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-text">
                    {b.room?.room_number} — {b.room?.branch?.name}
                  </p>
                  <p className="text-sm text-text-secondary">Ditempati {b.user?.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-heading font-semibold text-sm text-text">
                  {end.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className={`text-xs font-medium ${left <= 7 ? "text-error" : "text-text-secondary"}`}>
                  {left <= 0 ? "Sudah lewat" : `${left} hari lagi`}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
