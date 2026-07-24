import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, ChevronDown, Loader2 } from "lucide-react"
import { useRooms } from "@/hooks/useRooms"
import { RoomCard } from "@/components/rooms/RoomCard"
import { useBranches } from "@/hooks/useBranches"
import { usePageTitle } from "@/hooks/usePageTitle"

export default function RoomList() {
  usePageTitle("Cari Kamar")

  const [searchParams, setSearchParams] = useSearchParams()
  const branchParam = searchParams.get("branch") ?? ""
  const { data: branches } = useBranches()

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [branchParam, debouncedSearch])

  const branchId = branchParam ? Number(branchParam) : undefined

  const { data, isLoading, isError } = useRooms({
    page,
    limit: 9,
    branch_id: branchId,
    search: debouncedSearch || undefined,
  })
  const rooms = data?.rooms ?? []

  const handleBranchChange = (id: string) => {
    if (id) {
      setSearchParams({ branch: id })
    } else {
      setSearchParams({})
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-14 bg-paper">
      <div className="mb-8">
        <span className="font-mono text-xs uppercase tracking-widest text-primary">Daftar Kamar</span>
        <h1 className="font-heading font-medium text-3xl text-ink mt-1">Cari Kost</h1>
        <p className="text-text-secondary mt-1 font-mono text-sm">
          {data ? `${data.total} kamar tersedia` : "Memuat daftar kamar..."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari nomor kamar..."
            className="w-full border border-border rounded-sm pl-11 pr-4 py-2.5 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>

        <div className="relative sm:w-56">
          <select
            value={branchParam}
            onChange={(e) => handleBranchChange(e.target.value)}
            className="w-full appearance-none border border-border rounded-sm px-4 py-2.5 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          >
            <option value="">Semua cabang</option>
            {branches?.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20 text-text-secondary">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {isError && (
        <p className="text-clay text-center py-20 font-mono text-sm">Gagal memuat data kamar. Coba lagi nanti.</p>
      )}

      {data && rooms.length === 0 && !isLoading && (
        <p className="text-text-secondary text-center py-20">
          Tidak ada kamar yang cocok dengan pencarianmu.
        </p>
      )}

      {data && rooms.length > 0 && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
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