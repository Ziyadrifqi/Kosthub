import { useState, useMemo } from "react"
import { Wrench } from "lucide-react"
import { useMyTickets } from "@/hooks/useMaintenance"
import { useMyBookings } from "@/hooks/useBookings"
import { MaintenanceModal } from "@/components/MaintenanceModal"
import { usePageTitle } from "@/hooks/usePageTitle"

const statusLabel: Record<string, { text: string; class: string }> = {
  open: { text: "Menunggu", class: "bg-warning/10 text-warning" },
  in_progress: { text: "Sedang Ditangani", class: "bg-info/10 text-info" },
  resolved: { text: "Selesai", class: "bg-primary/10 text-primary" },
}

export default function MaintenanceTickets() {
  usePageTitle("Lapor Kerusakan")

  const { data: tickets } = useMyTickets()
  const { data: bookingsData } = useMyBookings()
  const [showModal, setShowModal] = useState(false)
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)

  // kamar-kamar yang SEDANG ditempati (confirmed) — bukan semua booking
  const activeRooms = useMemo(
    () => bookingsData?.bookings.filter((b) => b.status === "confirmed" && b.room) ?? [],
    [bookingsData]
  )

  const hasMultipleActive = activeRooms.length > 1
  const singleActiveRoom = activeRooms.length === 1 ? activeRooms[0].room : null

  const handleLaporClick = () => {
    if (singleActiveRoom) {
      setSelectedRoomId(singleActiveRoom.id)
      setShowModal(true)
    }
    // kalau >1 kamar aktif, tombol ini disembunyikan, ganti jadi list pilihan di bawah (lihat JSX)
  }

  const roomForModal = activeRooms.find((b) => b.room?.id === selectedRoomId)?.room

  return (
    <section className="max-w-2xl mx-auto px-6 py-14 bg-paper">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-medium text-2xl text-ink">Lapor Kerusakan</h1>
          <p className="text-text-secondary text-sm mt-1">Riwayat laporan & status penanganannya.</p>
        </div>
        {singleActiveRoom && (
          <button
            onClick={handleLaporClick}
            className="flex items-center gap-2 font-heading font-medium text-sm bg-ink hover:bg-primary text-paper rounded-sm px-4 py-2 transition-colors"
          >
            <Wrench size={15} /> Lapor Baru
          </button>
        )}
      </div>

      {activeRooms.length === 0 && (
        <p className="text-text-secondary text-sm bg-section rounded-md p-4 mb-6">
          Kamu belum punya kamar aktif untuk melapor kerusakan.
        </p>
      )}

      {/* cuma muncul kalau customer punya lebih dari 1 kamar aktif sekaligus — kasus jarang */}
      {hasMultipleActive && (
        <div className="bg-section rounded-md p-4 mb-6">
          <p className="text-sm font-heading font-medium text-ink mb-2">Lapor untuk kamar mana?</p>
          <div className="flex flex-wrap gap-2">
            {activeRooms.map((b) => (
              <button
                key={b.room!.id}
                onClick={() => { setSelectedRoomId(b.room!.id); setShowModal(true) }}
                className="text-xs font-heading font-medium bg-card border border-border rounded-full px-3 py-1.5 hover:border-primary hover:text-primary transition-colors"
              >
                {b.room!.room_number}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tickets?.map((t) => {
          const status = statusLabel[t.status] ?? { text: t.status, class: "bg-section text-text-secondary" }
          return (
            <div key={t.id} className="bg-card border border-border rounded-md p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading font-medium text-sm text-ink">{t.room?.room_number}</p>
                  <p className="text-sm text-text-secondary mt-1">{t.description}</p>
                  <p className="text-xs text-text-secondary mt-2 font-mono">
                    {new Date(t.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <span className={`text-xs font-heading font-semibold px-2.5 py-1 rounded-full shrink-0 ${status.class}`}>
                  {status.text}
                </span>
              </div>
            </div>
          )
        })}
        {tickets?.length === 0 && (
          <p className="text-text-secondary text-center py-12">Belum ada laporan kerusakan.</p>
        )}
      </div>

      {showModal && roomForModal && (
        <MaintenanceModal
          roomId={roomForModal.id}
          roomNumber={roomForModal.room_number}
          onClose={() => { setShowModal(false); setSelectedRoomId(null) }}
        />
      )}
    </section>
  )
}