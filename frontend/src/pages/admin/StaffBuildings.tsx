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
import { useBranches } from "@/hooks/useBranches"
import { usePageTitle } from "@/hooks/usePageTitle"

interface BuildingForm {
  name: string
  total_floor: number
  latitude: string
  longitude: string
}

const emptyForm: BuildingForm = { name: "", total_floor: 1, latitude: "", longitude: "" }

export default function StaffBuildings() {
  usePageTitle("Kelola Gedung")

  const { user } = useAuthStore()
  const isSuperAdmin = user?.role?.name === "super_admin"
  const myBranchId = user?.branch_id
  const { data: branches } = useBranches()

  const [selectedBranch, setSelectedBranch] = useState<number | undefined>(
    isSuperAdmin ? undefined : myBranchId
  )

  const { data: buildings } = useBuildings(selectedBranch)

  const createBuilding = useCreateBuilding()
  const updateBuilding = useUpdateBuilding()
  const deleteBuilding = useDeleteBuilding()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<BuildingForm>(emptyForm)
  const [formBranch, setFormBranch] = useState<number | undefined>(isSuperAdmin ? undefined : myBranchId)
  const [search, setSearch] = useState("")

  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null)
  const [editForm, setEditForm] = useState<BuildingForm>(emptyForm)

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
      {
        branch_id: branchId,
        name: form.name,
        total_floor: form.total_floor,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      },
      {
        onSuccess: () => {
          setForm(emptyForm)
          setShowForm(false)
        },
      }
    )
  }

  const openEdit = (b: Building) => {
    setEditingBuilding(b)
    setEditForm({
      name: b.name,
      total_floor: b.total_floor,
      latitude: b.latitude ? String(b.latitude) : "",
      longitude: b.longitude ? String(b.longitude) : "",
    })
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBuilding) return
    updateBuilding.mutate(
      {
        id: editingBuilding.id,
        name: editForm.name,
        total_floor: editForm.total_floor,
        latitude: editForm.latitude ? Number(editForm.latitude) : undefined,
        longitude: editForm.longitude ? Number(editForm.longitude) : undefined,
      },
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-extrabold text-2xl text-text">Kelola Gedung</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 font-heading font-medium text-sm bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 transition-colors"
        >
          <Plus size={16} /> Tambah Gedung
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {isSuperAdmin && (
          <select
            value={selectedBranch ?? ""}
            onChange={(e) => setSelectedBranch(Number(e.target.value) || undefined)}
            className="border border-border rounded-lg px-4 py-2.5 text-sm sm:w-56"
          >
            <option value="">Semua Cabang</option>
            {branches?.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
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
              {branches?.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
          <input
            placeholder="Nama Gedung (mis. Gedung A)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
          />
          <input
            type="number"
            placeholder="Jumlah Lantai"
            value={form.total_floor}
            onChange={(e) => setForm({ ...form, total_floor: Number(e.target.value) })}
            min={1}
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="any"
              placeholder="Latitude (mis. -6.401)"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude (mis. 106.822)"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
            />
          </div>
          <p className="text-xs text-text-secondary -mt-2">
            Opsional, dipakai untuk peta interaktif. Buka Google Maps, klik kanan di lokasi gedung, klik koordinat yang muncul untuk menyalin.
          </p>

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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            {!b.latitude && (
              <p className="text-xs text-warning mt-1">Lokasi belum diatur (tidak muncul di peta)</p>
            )}

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
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nama Gedung"
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
              />
              <input
                type="number"
                value={editForm.total_floor}
                onChange={(e) => setEditForm({ ...editForm, total_floor: Number(e.target.value) })}
                placeholder="Jumlah Lantai"
                min={1}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={editForm.latitude}
                  onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={editForm.longitude}
                  onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
                />
              </div>

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