import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useFacilities, useCreateFacility, useDeleteFacility } from "@/hooks/useFacilities"
import { usePageTitle } from "@/hooks/usePageTitle"

export default function SuperAdminFacilities() {
  usePageTitle("Kelola Fasilitas")

  const { data: facilities } = useFacilities()
  const createFacility = useCreateFacility()
  const deleteFacility = useDeleteFacility()

  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createFacility.mutate({ name, icon: "" }, { onSuccess: () => setName("") })
  }

  return (
    <div className="p-8">
      <h1 className="font-heading font-extrabold text-2xl text-text mb-1">Kelola Fasilitas</h1>
      <p className="text-text-secondary mb-6">
        Master daftar fasilitas — staff akan memilih dari daftar ini saat mengatur fasilitas tiap kamar.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6 max-w-md">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama fasilitas (mis. AC, WiFi, Kamar Mandi Dalam)"
          className="flex-1 border border-border rounded-lg px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={createFacility.isPending}
          className="flex items-center gap-2 font-heading font-medium text-sm bg-primary text-white rounded-lg px-4 py-2.5 disabled:opacity-60"
        >
          <Plus size={16} /> Tambah
        </button>
      </form>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {facilities?.map((f) => (
          <div key={f.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-text">{f.name}</span>
            <button
              onClick={() => confirm(`Hapus fasilitas "${f.name}"?`) && deleteFacility.mutate(f.id)}
              className="text-text-secondary hover:text-error transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {facilities?.length === 0 && (
          <p className="col-span-full text-text-secondary text-sm">Belum ada fasilitas. Tambahkan minimal beberapa dulu di atas.</p>
        )}
      </div>
    </div>
  )
}