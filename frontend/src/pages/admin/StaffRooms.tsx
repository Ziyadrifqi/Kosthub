import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useRooms } from "@/hooks/useRooms"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { branches } from "@/lib/branches"

export default function StaffRooms() {
  const { user } = useAuthStore()
  const isSuperAdmin = user?.role?.name === "super_admin"

  // staff terkunci ke cabangnya sendiri; super_admin bisa pilih semua
  const myBranchId = user?.branch_id ?? undefined
  const myBranch = branches.find((b) => b.id === myBranchId)

  const { data } = useRooms({ page: 1, limit: 50, branch_id: isSuperAdmin ? undefined : myBranchId })
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    branch_id: isSuperAdmin ? "" : String(myBranchId ?? ""),
    building_id: "",
    room_type_id: "",
    room_number: "",
    price: "",
  })

  const createRoom = useMutation({
    mutationFn: async () => {
      await api.post("/staff/rooms", {
        branch_id: Number(form.branch_id),
        building_id: Number(form.building_id),
        room_type_id: Number(form.room_type_id),
        room_number: form.room_number,
        price: Number(form.price),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      setShowForm(false)
      setForm({ branch_id: isSuperAdmin ? "" : String(myBranchId ?? ""), building_id: "", room_type_id: "", room_number: "", price: "" })
    },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-heading font-extrabold text-2xl text-text">Kelola Kamar</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 font-heading font-medium text-sm bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 transition-colors"
        >
          <Plus size={16} /> Tambah Kamar
        </button>
      </div>

      {!isSuperAdmin && (
        <p className="text-text-secondary text-sm mb-6">
          Kamu hanya bisa mengelola kamar di cabang: <strong className="text-text">{myBranch?.name ?? "belum ditentukan"}</strong>
        </p>
      )}

      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); createRoom.mutate() }}
          className="bg-card border border-border rounded-2xl p-6 mb-6 grid sm:grid-cols-2 gap-4"
        >
          {isSuperAdmin ? (
            <select
              value={form.branch_id}
              onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
              required
              className="border border-border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Pilih Cabang</option>
              {branches.map((b) => (
                <option key={b.code} value={b.id}>{b.name}</option>
              ))}
            </select>
          ) : (
            <input
              value={myBranch?.name ?? "Cabang belum diset"}
              disabled
              className="border border-border rounded-lg px-3 py-2 text-sm bg-section text-text-secondary cursor-not-allowed"
            />
          )}

          <input placeholder="ID Gedung" value={form.building_id} onChange={(e) => setForm({ ...form, building_id: e.target.value })} className="border border-border rounded-lg px-3 py-2 text-sm" required />
          <input placeholder="ID Tipe Kamar" value={form.room_type_id} onChange={(e) => setForm({ ...form, room_type_id: e.target.value })} className="border border-border rounded-lg px-3 py-2 text-sm" required />
          <input placeholder="Nomor Kamar (mis. A101)" value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} className="border border-border rounded-lg px-3 py-2 text-sm" required />
          <input placeholder="Harga per bulan" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border border-border rounded-lg px-3 py-2 text-sm" required />

          {createRoom.isError && (
            <p className="text-error text-xs sm:col-span-2">Gagal menambah kamar. Cek kembali data yang diisi.</p>
          )}

          <button type="submit" disabled={createRoom.isPending} className="sm:col-span-2 font-heading font-medium text-sm bg-primary text-white rounded-lg py-2.5 disabled:opacity-60">
            {createRoom.isPending ? "Menyimpan..." : "Simpan Kamar"}
          </button>
        </form>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-section text-text-secondary font-heading font-semibold">
            <tr>
              <th className="text-left px-5 py-3">Kamar</th>
              <th className="text-left px-5 py-3">Cabang</th>
              <th className="text-left px-5 py-3">Harga</th>
              <th className="text-left px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.rooms.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-5 py-3 text-text">{r.room_number}</td>
                <td className="px-5 py-3 text-text-secondary">{r.branch?.name}</td>
                <td className="px-5 py-3 text-text-secondary">Rp{r.price.toLocaleString("id-ID")}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-heading font-semibold px-2.5 py-1 rounded-full ${r.status === "available" ? "bg-primary/10 text-primary" : "bg-section text-text-secondary"}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {data?.rooms.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-text-secondary py-8">Belum ada kamar di cabang ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}