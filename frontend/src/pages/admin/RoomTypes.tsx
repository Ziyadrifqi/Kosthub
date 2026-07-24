import { useState } from "react"
import { Plus, Pencil, Trash2, X, DoorOpen} from "lucide-react"
import {
  useRoomTypes,
  useCreateRoomType,
  useUpdateRoomType,
  useDeleteRoomType,
  type RoomType,
} from "@/hooks/useBuildingsAndTypes"
import { usePageTitle } from "@/hooks/usePageTitle"

export default function RoomTypes() {
  usePageTitle("Tipe Kamar")
  const { data: types } = useRoomTypes()
  const createRoomType = useCreateRoomType()
  const updateRoomType = useUpdateRoomType()
  const deleteRoomType = useDeleteRoomType()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", base_price: "" })

  const [editingType, setEditingType] = useState<RoomType | null>(null)
  const [editForm, setEditForm] = useState({ name: "", description: "", base_price: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createRoomType.mutate(
      { name: form.name, description: form.description, base_price: Number(form.base_price) },
      { onSuccess: () => { setForm({ name: "", description: "", base_price: "" }); setShowForm(false) } }
    )
  }

  const openEdit = (t: RoomType) => {
    setEditingType(t)
    setEditForm({ name: t.name, description: t.description, base_price: String(t.base_price) })
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingType) return
    updateRoomType.mutate(
      { id: editingType.id, name: editForm.name, description: editForm.description, base_price: Number(editForm.base_price) },
      { onSuccess: () => setEditingType(null) }
    )
  }

  const handleDelete = (t: RoomType) => {
    if (confirm(`Yakin ingin menghapus tipe "${t.name}"?`)) {
      deleteRoomType.mutate(t.id, {
        onError: (err: any) => {
          alert(err?.response?.data?.error ?? "Gagal menghapus tipe kamar.")
        },
      })
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-extrabold text-2xl text-text">Tipe Kamar</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 font-heading font-medium text-sm bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 transition-colors"
        >
          <Plus size={16} /> Tambah Tipe
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-4 max-w-md">
          <input
            placeholder="Nama Tipe (mis. Standard, Deluxe)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
          />
          <textarea
            placeholder="Deskripsi"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm resize-none"
          />
          <input
            type="number"
            placeholder="Harga Dasar"
            value={form.base_price}
            onChange={(e) => setForm({ ...form, base_price: e.target.value })}
            required
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
          />

          {createRoomType.isError && (
            <p className="text-error text-xs">Gagal menambah tipe kamar.</p>
          )}

          <button
            type="submit"
            disabled={createRoomType.isPending}
            className="font-heading font-medium text-sm bg-primary text-white rounded-lg px-5 py-2.5 disabled:opacity-60"
          >
            {createRoomType.isPending ? "Menyimpan..." : "Simpan Tipe"}
          </button>
        </form>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {types?.map((t) => (
          <div key={t.id} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-heading font-semibold text-text">{t.name}</p>
                <p className="text-sm text-text-secondary mt-1">{t.description}</p>
                <p className="font-heading font-bold text-primary mt-2">
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border text-sm text-text-secondary">
  <DoorOpen size={14} />
  <span>{t.room_count} kamar pakai tipe ini</span>
</div>
                  Rp{t.base_price.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEdit(t)}
                  className="p-1.5 text-text-secondary hover:text-primary transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(t)}
                  className="p-1.5 text-text-secondary hover:text-error transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {types?.length === 0 && (
          <div className="col-span-full text-center text-text-secondary py-12 bg-card border border-border rounded-2xl">
            Belum ada tipe kamar.
          </div>
        )}
      </div>

      {editingType && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm relative">
            <button
              onClick={() => setEditingType(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text"
            >
              <X size={20} />
            </button>
            <h3 className="font-heading font-bold text-lg text-text mb-4">Edit Tipe Kamar</h3>

            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nama Tipe"
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Deskripsi"
                rows={2}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm resize-none"
              />
              <input
                type="number"
                value={editForm.base_price}
                onChange={(e) => setEditForm({ ...editForm, base_price: e.target.value })}
                placeholder="Harga Dasar"
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
              />

              {updateRoomType.isError && (
                <p className="text-error text-xs">Gagal menyimpan perubahan.</p>
              )}

              <button
                type="submit"
                disabled={updateRoomType.isPending}
                className="w-full font-heading font-medium text-sm bg-primary text-white rounded-lg py-2.5 disabled:opacity-60"
              >
                {updateRoomType.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}