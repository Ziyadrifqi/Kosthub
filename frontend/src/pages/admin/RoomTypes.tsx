import { useState } from "react"
import { Plus } from "lucide-react"
import { useRoomTypes, useCreateRoomType } from "@/hooks/useBuildingsAndTypes"

export default function RoomTypes() {
  const { data: types } = useRoomTypes()
  const createRoomType = useCreateRoomType()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", base_price: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createRoomType.mutate(
      { name: form.name, description: form.description, base_price: Number(form.base_price) },
      { onSuccess: () => { setForm({ name: "", description: "", base_price: "" }); setShowForm(false) } }
    )
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
          <input placeholder="Nama Tipe (mis. Standard, Deluxe)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full border border-border rounded-lg px-4 py-2.5 text-sm" />
          <textarea placeholder="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm resize-none" />
          <input type="number" placeholder="Harga Dasar" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} required className="w-full border border-border rounded-lg px-4 py-2.5 text-sm" />
          <button type="submit" disabled={createRoomType.isPending} className="font-heading font-medium text-sm bg-primary text-white rounded-lg px-5 py-2.5 disabled:opacity-60">
            {createRoomType.isPending ? "Menyimpan..." : "Simpan Tipe"}
          </button>
        </form>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {types?.map((t) => (
          <div key={t.id} className="bg-card border border-border rounded-2xl p-5">
            <p className="font-heading font-semibold text-text">{t.name}</p>
            <p className="text-sm text-text-secondary mt-1">{t.description}</p>
            <p className="font-heading font-bold text-primary mt-2">Rp{t.base_price.toLocaleString("id-ID")}</p>
          </div>
        ))}
      </div>
    </div>
  )
}