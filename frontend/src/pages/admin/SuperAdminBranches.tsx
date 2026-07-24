import { useState } from "react"
import { Plus, Pencil, Trash2, X, MapPin } from "lucide-react"
import { useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch, type Branch } from "@/hooks/useBranches"
import { usePageTitle } from "@/hooks/usePageTitle"

const emptyForm = { name: "", city: "", address: "" }

export default function SuperAdminBranches() {
  usePageTitle("Kelola Cabang")

  const { data: branches } = useBranches()
  const createBranch = useCreateBranch()
  const updateBranch = useUpdateBranch()
  const deleteBranch = useDeleteBranch()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true) }
  const openEdit = (b: Branch) => { setEditingId(b.id); setForm({ name: b.name, city: b.city, address: b.address ?? "" }); setShowForm(true) }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateBranch.mutate({ id: editingId, ...form }, { onSuccess: () => setShowForm(false) })
    } else {
      createBranch.mutate(form, { onSuccess: () => setShowForm(false) })
    }
  }

  const handleDelete = (b: Branch) => {
    if (confirm(`Hapus cabang "${b.name}"? Pastikan tidak ada gedung yang masih terhubung.`)) {
      deleteBranch.mutate(b.id, {
        onError: (err: any) => alert(err?.response?.data?.error ?? "Gagal menghapus cabang."),
      })
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-extrabold text-2xl text-text">Kelola Cabang</h1>
        <button onClick={openCreate} className="flex items-center gap-2 font-heading font-medium text-sm bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 transition-colors">
          <Plus size={16} /> Tambah Cabang
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {branches?.map((b) => (
          <div key={b.id} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-heading font-semibold text-text">{b.name}</p>
                <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                  <MapPin size={13} /> {b.city}
                </p>
                {b.address && <p className="text-xs text-text-secondary mt-2">{b.address}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(b)} className="p-1.5 text-text-secondary hover:text-primary transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(b)} className="p-1.5 text-text-secondary hover:text-error transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {branches?.length === 0 && (
          <div className="col-span-full text-center text-text-secondary py-12 bg-card border border-border rounded-2xl">
            Belum ada cabang.
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-text-secondary hover:text-text">
              <X size={20} />
            </button>
            <h3 className="font-heading font-bold text-lg text-text mb-4">{editingId ? "Edit Cabang" : "Tambah Cabang"}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Nama Cabang (mis. KostHub Depok)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full border border-border rounded-lg px-4 py-2.5 text-sm" />
              <input placeholder="Kota" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required className="w-full border border-border rounded-lg px-4 py-2.5 text-sm" />
              <textarea placeholder="Alamat (opsional)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm resize-none" />
              <button type="submit" disabled={createBranch.isPending || updateBranch.isPending} className="w-full font-heading font-medium text-sm bg-primary text-white rounded-lg py-2.5 disabled:opacity-60">
                {createBranch.isPending || updateBranch.isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}