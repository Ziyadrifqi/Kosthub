import { useState, useMemo } from "react"
import { Plus, Search, Building2, DoorOpen, Pencil, Trash2, X } from "lucide-react"
import {
  useBuildings,
  useCreateBuilding,
  useUpdateBuilding,
  useDeleteBuilding,
  type Building,
} from "@/hooks/useBuildingsAndTypes"
import { useAuthStore } from "@/store/authStore"
import { branches } from "@/lib/branches"

export default function StaffBuildings() {
  const { user } = useAuthStore()
  const isSuperAdmin = user?.role?.name === "super_admin"
  const myBranchId = user?.branch_id

  const [selectedBranch, setSelectedBranch] = useState<number | undefined>(
    isSuperAdmin ? undefined : myBranchId
  )

  // default enabled: true di hook, jadi tetap fetch semua gedung
  // walau selectedBranch masih undefined (filter "Semua Cabang")
  const { data: buildings } = useBuildings(selectedBranch)

  const createBuilding = useCreateBuilding()
  const updateBuilding = useUpdateBuilding()
  const deleteBuilding = useDeleteBuilding()

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [totalFloor, setTotalFloor] = useState(1)
  const [formBranch, setFormBranch] = useState<number | undefined>(isSuperAdmin ? undefined : myBranchId)
  const [search, setSearch] = useState("")

  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null)
  const [editName, setEditName] = useState("")
  const [editFloor, setEditFloor] = useState(1)

  const filteredBuildings = useMemo(() => {
    if (!buildings) return []
    if (!search.trim()) return buildings
    const term = search.toLowerCase()
    return buildings.filter(
      (b) => b.name.toLowerCase().includes(term) || b.branch?.name.toLowerCase().includes(term)
    )
  }, [buildings, search])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const branchId = isSuperAdmin ? formBranch : myBranchId
    if (!branchId) return
    createBuilding.mutate(
      { branch_id: branchId, name, total_floor: totalFloor },
      {
        onSuccess: () => {
          setName("")
          setTotalFloor(1)
          setShowForm(false)
        },
      }
    )
  }

  const openEdit = (b: Building) => {
    setEditingBuilding(b)
    setEditName(b.name)
    setEditFloor(b.total_floor)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBuilding) return
    updateBuilding.mutate(
      { id: editingBuilding.id, name: editName, total_floor: editFloor },
      { onSuccess: () => setEditingBuilding(null) }
    )
  }

  const handleDelete = (b: Building) => {
    if (b.room_count > 0) {
      alert("Tidak bisa menghapus gedung yang masih memiliki kamar. Pindahkan/hapus kamar dulu.")
      return
    }
    if (confirm(`Yakin ingin menghapus "${b.name}"?`)) {
      deleteBuilding.mutate(b.id)
    }
  }

  return (
   <div className="p-4 sm:p-8">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
    <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-text">Kelola Gedung</h1>
    <button
      onClick={() => setShowForm(!showForm)}
      className="flex items-center justify-center gap-2 font-heading font-medium text-sm bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 transition-colors w-full sm:w-auto"
    >
      <Plus size={16} /> Tambah Gedung
    </button>
  </div>

      {/* Filter: pilih cabang (super_admin) + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {isSuperAdmin && (
          <select
            value={selectedBranch ?? ""}
            onChange={(e) => setSelectedBranch(Number(e.target.value) || undefined)}
            className="border border-border rounded-lg px-4 py-2.5 text-sm sm:w-56"
          >
            <option value="">Semua Cabang</option>
            {branches.map((b) => (
              <option key={b.code} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}

        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama gedung atau cabang..."
            className="w-full border border-border rounded-lg pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-4 max-w-md">
          {isSuperAdmin && (
            <select
              value={formBranch ?? ""}
              onChange={(e) => setFormBranch(Number(e.target.value) || undefined)}
              required
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
            >
              <option value="">Pilih Cabang untuk gedung ini</option>
              {branches.map((b) => (
                <option key={b.code} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
          <input
            placeholder="Nama Gedung (mis. Gedung A)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
          />
          <input
            type="number"
            placeholder="Jumlah Lantai"
            value={totalFloor}
            onChange={(e) => setTotalFloor(Number(e.target.value))}
            min={1}
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
          />

          {createBuilding.isError && (
            <p className="text-error text-xs">Gagal menambah gedung. Pastikan semua data terisi benar.</p>
          )}

          <button
            type="submit"
            disabled={createBuilding.isPending}
            className="font-heading font-medium text-sm bg-primary text-white rounded-lg px-5 py-2.5 disabled:opacity-60"
          >
            {createBuilding.isPending ? "Menyimpan..." : "Simpan Gedung"}
          </button>
        </form>
      )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuildings.map((b) => (
          <div key={b.id} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 size={18} className="text-primary" />
              </div>
              <span className="text-xs font-heading font-semibold text-text-secondary bg-section px-2.5 py-1 rounded-full">
                {b.branch?.name ?? "Cabang tidak diketahui"}
              </span>
            </div>

            <p className="font-heading font-semibold text-text">{b.name}</p>
            <p className="text-sm text-text-secondary mt-1">{b.total_floor} lantai</p>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                <DoorOpen size={14} /> {b.room_count} kamar
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(b)}
                  className="p-1.5 text-text-secondary hover:text-primary transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(b)}
                  className="p-1.5 text-text-secondary hover:text-error transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredBuildings.length === 0 && (
          <div className="col-span-full text-center text-text-secondary py-12 bg-card border border-border rounded-2xl">
            {search ? "Tidak ada gedung yang cocok dengan pencarian." : "Belum ada gedung."}
          </div>
        )}
      </div>

      {editingBuilding && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm relative">
            <button
              onClick={() => setEditingBuilding(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text"
            >
              <X size={20} />
            </button>
            <h3 className="font-heading font-bold text-lg text-text mb-4">Edit Gedung</h3>

            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nama Gedung"
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
              />
              <input
                type="number"
                value={editFloor}
                onChange={(e) => setEditFloor(Number(e.target.value))}
                placeholder="Jumlah Lantai"
                min={1}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
              />

              {updateBuilding.isError && (
                <p className="text-error text-xs">Gagal menyimpan perubahan.</p>
              )}

              <button
                type="submit"
                disabled={updateBuilding.isPending}
                className="w-full font-heading font-medium text-sm bg-primary text-white rounded-lg py-2.5 disabled:opacity-60"
              >
                {updateBuilding.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}