import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarCheck, MessageCircle, X } from "lucide-react"
import { api } from "@/lib/api"

interface CheckInBooking {
  id: string
  check_in: string
  user?: { name: string }
  room?: { room_number: string; branch?: { name: string } }
}

export default function CheckInSchedule() {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ["upcoming-checkins"],
    queryFn: async () => {
      const res = await api.get<{ bookings: CheckInBooking[] }>("/staff/bookings/upcoming-checkins")
      return res.data.bookings
    },
  })

  const [rescheduling, setRescheduling] = useState<CheckInBooking | null>(null)
  const [newDate, setNewDate] = useState("")

  const reschedule = useMutation({
    mutationFn: async () => {
      if (!rescheduling) return
      await api.patch(`/staff/bookings/${rescheduling.id}/reschedule`, { check_in: newDate })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upcoming-checkins"] })
      setRescheduling(null)
    },
  })

  const markCheckedIn = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/staff/bookings/${id}/check-in`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["upcoming-checkins"] }),
  })

  const daysUntil = (dateStr: string) => Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="p-8">
      <h1 className="font-heading font-extrabold text-2xl text-text mb-1">Jadwal Check-in</h1>
      <p className="text-text-secondary mb-8">
        Booking yang sudah dibayar & dikonfirmasi, menunggu customer datang. Koordinasikan tanggal pasti lewat live chat.
      </p>

      {data?.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-text-secondary">
          Tidak ada jadwal check-in yang menunggu.
        </div>
      )}

      <div className="space-y-3">
        {data?.map((b) => {
          const days = daysUntil(b.check_in)
          return (
            <div key={b.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CalendarCheck size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-text">{b.user?.name}</p>
                  <p className="text-sm text-text-secondary">
                    {b.room?.room_number} · {b.room?.branch?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-heading font-semibold text-sm text-text">
                    {new Date(b.check_in).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}
                  </p>
                  <p className={`text-xs font-medium ${days < 0 ? "text-error" : days <= 2 ? "text-warning" : "text-text-secondary"}`}>
                    {days < 0 ? `Terlewat ${Math.abs(days)} hari` : days === 0 ? "Hari ini" : `${days} hari lagi`}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setRescheduling(b); setNewDate(b.check_in.split("T")[0]) }}
                    className="text-xs font-heading font-medium border border-border rounded-lg px-3 py-2 hover:bg-section transition-colors"
                  >
                    Ubah Jadwal
                  </button>
                  <button
                    onClick={() => markCheckedIn.mutate(b.id)}
                    className="text-xs font-heading font-medium bg-primary text-white rounded-lg px-3 py-2 hover:bg-primary-hover transition-colors"
                  >
                    Sudah Check-in
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {rescheduling && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm relative">
            <button onClick={() => setRescheduling(null)} className="absolute top-4 right-4 text-text-secondary hover:text-text">
              <X size={20} />
            </button>
            <h3 className="font-heading font-bold text-lg text-text mb-1">Ubah Jadwal Check-in</h3>
            <p className="text-sm text-text-secondary mb-4 flex items-center gap-1.5">
              <MessageCircle size={14} /> Pastikan sudah dikonfirmasi via chat dengan {rescheduling.user?.name}
            </p>

            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm mb-4"
            />

            <button
              onClick={() => reschedule.mutate()}
              disabled={reschedule.isPending}
              className="w-full font-heading font-medium text-sm bg-primary text-white rounded-lg py-2.5 disabled:opacity-60"
            >
              {reschedule.isPending ? "Menyimpan..." : "Simpan Jadwal Baru"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}