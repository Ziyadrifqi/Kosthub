import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRooms } from "@/hooks/useRooms"
import { useBuildings, useRoomTypes } from "@/hooks/useBuildingsAndTypes"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { branches } from "@/lib/branches"
import { Plus, Pencil, Trash2, X } from "lucide-react"

export default function StaffRooms() {
  const { user } = useAuthStore()
  const isSuperAdmin = user?.role?.name === "super_admin"

  // staff terkunci ke cabangnya sendiri; super_admin bisa pilih semua
  const myBranchId = user?.branch_id ?? undefined
  const myBranch = branches.find((b) => b.id === myBranchId)

  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    branch_id: isSuperAdmin ? "" : String(myBranchId ?? ""),
    building_id: "",
    room_type_id: "",
    room_number: "",
    price: "",
  })

  // cabang yang sedang aktif dipakai buat filter list & dropdown gedung
  const activeBranchId = isSuperAdmin ? Number(form.branch_id) || undefined : myBranchId

  const { data } = useRooms({ page: 1, limit: 50, branch_id: isSuperAdmin ? undefined : myBranchId })
  const { data: buildings } = useBuildings(activeBranchId)
  const { data: roomTypes } = useRoomTypes()

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
      setForm({
        branch_id: isSuperAdmin ? "" : String(myBranchId ?? ""),
        building_id: "",
        room_type_id: "",
        room_number: "",
        price: "",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createRoom.mutate()
  }
const [editingRoom, setEditingRoom] = useState<{ id: number; room_number: string; price: string; status: string } | null>(null)

const updateRoom = useMutation({
  mutationFn: async () => {
    if (!editingRoom) return
    await api.patch(`/staff/rooms/${editingRoom.id}`, {
      room_number: editingRoom.room_number,
      price: Number(editingRoom.price),
      status: editingRoom.status,
    })
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["rooms"] })
    setEditingRoom(null)
  },
})

const deleteRoom = useMutation({
  mutationFn: async (id: number) => {
    await api.delete(`/staff/rooms/${id}`)
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms"] }),
})

const handleDelete = (id: number, roomNumber: string) => {
  if (confirm(`Yakin ingin menghapus kamar ${roomNumber}?`)) {
    deleteRoom.mutate(id)
  }
}
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
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 mb-6 grid sm:grid-cols-2 gap-4">
          {isSuperAdmin ? (
            <select
              value={form.branch_id}
              onChange={(e) => setForm({ ...form, branch_id: e.target.value, building_id: "" })}
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

          <select
            value={form.building_id}
            onChange={(e) => setForm({ ...form, building_id: e.target.value })}
            required
            disabled={!activeBranchId}
            className="border border-border rounded-lg px-3 py-2 text-sm disabled:bg-section disabled:cursor-not-allowed"
          >
            <option value="">{activeBranchId ? "Pilih Gedung" : "Pilih cabang dulu"}</option>
            {buildings?.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select
            value={form.room_type_id}
            onChange={(e) => setForm({ ...form, room_type_id: e.target.value })}
            required
            className="border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Pilih Tipe Kamar</option>
            {roomTypes?.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <input
            placeholder="Nomor Kamar (mis. A101)"
            value={form.room_number}
            onChange={(e) => setForm({ ...form, room_number: e.target.value })}
            required
            className="border border-border rounded-lg px-3 py-2 text-sm"
          />

          <input
            type="number"
            placeholder="Harga per bulan"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            className="border border-border rounded-lg px-3 py-2 text-sm"
          />

          {createRoom.isError && (
            <p className="text-error text-xs sm:col-span-2">
              Gagal menambah kamar. Cek kembali data yang diisi, atau pastikan gedung/tipe kamar sudah dibuat.
            </p>
          )}

          <button
            type="submit"
            disabled={createRoom.isPending}
            className="sm:col-span-2 font-heading font-medium text-sm bg-primary text-white rounded-lg py-2.5 disabled:opacity-60"
          >
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
      <th className="text-left px-5 py-3">Aksi</th>
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
        <td className="px-5 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => setEditingRoom({ id: r.id, room_number: r.room_number, price: String(r.price), status: r.status })}
              className="p-1.5 text-text-secondary hover:text-primary transition-colors"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => handleDelete(r.id, r.room_number)}
              className="p-1.5 text-text-secondary hover:text-error transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </td>
      </tr>
    ))}
    {data?.rooms.length === 0 && (
      <tr><td colSpan={5} className="text-center text-text-secondary py-8">Belum ada kamar di cabang ini.</td></tr>
    )}
  </tbody>
</table>
      </div>
      {editingRoom && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
    <div className="bg-card rounded-2xl p-6 w-full max-w-sm relative">
      <button onClick={() => setEditingRoom(null)} className="absolute top-4 right-4 text-text-secondary hover:text-text">
        <X size={20} />
      </button>
      <h3 className="font-heading font-bold text-lg text-text mb-4">Edit Kamar</h3>

      <div className="space-y-3">
        <input
          value={editingRoom.room_number}
          onChange={(e) => setEditingRoom({ ...editingRoom, room_number: e.target.value })}
          placeholder="Nomor Kamar"
          className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
        />
        <input
          type="number"
          value={editingRoom.price}
          onChange={(e) => setEditingRoom({ ...editingRoom, price: e.target.value })}
          placeholder="Harga"
          className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
        />
        <select
          value={editingRoom.status}
          onChange={(e) => setEditingRoom({ ...editingRoom, status: e.target.value })}
          className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
        >
          <option value="available">Available</option>
          <option value="booked">Booked</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <button
        onClick={() => updateRoom.mutate()}
        disabled={updateRoom.isPending}
        className="w-full mt-4 font-heading font-medium text-sm bg-primary text-white rounded-lg py-2.5 disabled:opacity-60"
      >
        {updateRoom.isPending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </div>
  </div>
)}
    </div>
  )
}