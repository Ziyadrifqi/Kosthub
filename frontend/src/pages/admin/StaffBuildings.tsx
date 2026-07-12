import { useState } from "react"
import { Plus } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { branches } from "@/lib/branches"
import { useBuildings, useCreateBuilding } from "@/hooks/useBuildingsAndTypes"

export default function StaffBuildings() {
  const { user } = useAuthStore()
  const isSuperAdmin = user?.role?.name === "super_admin"
  const myBranchId = user?.branch_id

  const [selectedBranch, setSelectedBranch] = useState<number | undefined>(isSuperAdmin ? undefined : myBranchId)
  const { data: buildings } = useBuildings(selectedBranch)
  const createBuilding = useCreateBuilding()

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [totalFloor, setTotalFloor] = useState(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const branchId = isSuperAdmin ? selectedBranch : myBranchId
    if (!branchId) return
    createBuilding.mutate(
      { branch_id: branchId, name, total_floor: totalFloor },
      { onSuccess: () => { setName(""); setTotalFloor(1); setShowForm(false) } }
    )
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

      {isSuperAdmin && (
        <select
          value={selectedBranch ?? ""}
          onChange={(e) => setSelectedBranch(Number(e.target.value) || undefined)}
          className="border border-border rounded-lg px-4 py-2.5 text-sm mb-6"
        >
          <option value="">Pilih cabang untuk dilihat</option>
          {branches.map((b) => <option key={b.code} value={b.id}>{b.name}</option>)}
        </select>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-4 max-w-md">
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
          <button type="submit" disabled={createBuilding.isPending} className="font-heading font-medium text-sm bg-primary text-white rounded-lg px-5 py-2.5 disabled:opacity-60">
            {createBuilding.isPending ? "Menyimpan..." : "Simpan Gedung"}
          </button>
        </form>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-section text-text-secondary font-heading font-semibold">
            <tr><th className="text-left px-5 py-3">Nama Gedung</th><th className="text-left px-5 py-3">Jumlah Lantai</th></tr>
          </thead>
          <tbody>
            {buildings?.map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="px-5 py-3 text-text">{b.name}</td>
                <td className="px-5 py-3 text-text-secondary">{b.total_floor}</td>
              </tr>
            ))}
            {(!buildings || buildings.length === 0) && (
              <tr><td colSpan={2} className="text-center text-text-secondary py-8">Belum ada gedung.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}