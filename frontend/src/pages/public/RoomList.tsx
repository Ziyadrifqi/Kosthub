import { useState } from "react"
import { useRooms } from "@/hooks/useRooms"
import { RoomCard } from "@/components/rooms/RoomCard"
import { Loader2 } from "lucide-react"

export default function RoomList() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useRooms({ page, limit: 9 })
  const rooms = data?.rooms ?? []

  return (
    <section className="max-w-6xl mx-auto px-6 py-14 bg-paper">
      <div className="mb-10">
        <span className="font-mono text-xs uppercase tracking-widest text-primary">Daftar Kamar</span>
        <h1 className="font-heading font-medium text-3xl text-ink mt-1">Cari Kost</h1>
        <p className="text-text-secondary mt-1 font-mono text-sm">
          {data ? `${data.total} kamar tersedia` : "Memuat daftar kamar..."}
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20 text-text-secondary">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {isError && (
        <p className="text-rust text-center py-20 font-mono text-sm">Gagal memuat data kamar. Coba lagi nanti.</p>
      )}

      {data && rooms.length === 0 && (
        <p className="text-text-secondary text-center py-20">Belum ada kamar tersedia saat ini.</p>
      )}

      {data && rooms.length > 0 && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mt-6">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>

          <div className="flex justify-center gap-3 mt-12">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="font-heading font-medium text-sm border border-border rounded-sm px-4 py-2 disabled:opacity-40 hover:bg-section transition-colors"
            >
              Sebelumnya
            </button>
            <span className="flex items-center font-mono text-sm text-text-secondary">Halaman {page}</span>
            <button
              disabled={rooms.length < 9}
              onClick={() => setPage((p) => p + 1)}
              className="font-heading font-medium text-sm border border-border rounded-sm px-4 py-2 disabled:opacity-40 hover:bg-section transition-colors"
            >
              Berikutnya
            </button>
          </div>
        </>
      )}
    </section>
  )
}
