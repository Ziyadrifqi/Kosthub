import { useMyFavorites } from "@/hooks/useFavorites"
import { RoomCard } from "@/components/rooms/RoomCard"

export default function Favorites() {
  const { data } = useMyFavorites()

  return (
    <section className="max-w-6xl mx-auto px-6 py-14 bg-paper">
      <span className="font-mono text-xs uppercase tracking-widest text-primary">Tersimpan</span>
      <h1 className="font-heading font-medium text-3xl text-ink mt-1 mb-8">Kost Favorit</h1>

      {data?.length === 0 && (
        <p className="text-text-secondary text-center py-16">Belum ada kamar yang kamu favoritkan.</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {data?.map((f) => <RoomCard key={f.room_id} room={f.room} />)}
      </div>
    </section>
  )
}
