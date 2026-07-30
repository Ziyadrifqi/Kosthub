import { useState, useEffect } from "react"
import { Search, User, X, CheckCircle2 } from "lucide-react"
import { useTenants, useTenantDetail, useUpdateTenantProfile, type TenantUser } from "@/hooks/useTenants"
import { usePageTitle } from "@/hooks/usePageTitle"

const statusLabel: Record<string, string> = {
  pending: "Menunggu Bayar", confirmed: "Aktif", cancelled: "Batal", completed: "Selesai",
}

export default function StaffTenants() {
  usePageTitle("Kelola Data Pengguna")

  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data } = useTenants(search, page)
  const [selectedTenant, setSelectedTenant] = useState<TenantUser | null>(null)

  return (
    <div className="p-8">
      <h1 className="font-heading font-extrabold text-2xl text-text mb-1">Kelola Data Pengguna</h1>
      <p className="text-text-secondary mb-6">
        Data tambahan penyewa yang pernah booking di cabangmu — baik online maupun langsung di lokasi.
      </p>

      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari nama atau email..."
          className="w-full border border-border rounded-lg pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-section text-text-secondary font-heading font-semibold">
            <tr>
              <th className="text-left px-5 py-3">Nama</th>
              <th className="text-left px-5 py-3">Email</th>
              <th className="text-left px-5 py-3">No. HP</th>
              <th className="text-left px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {data?.users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-5 py-3 text-text">{u.name}</td>
                <td className="px-5 py-3 text-text-secondary">{u.email}</td>
                <td className="px-5 py-3 text-text-secondary">{u.phone ?? "-"}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => setSelectedTenant(u)}
                    className="text-xs font-heading font-medium text-primary hover:underline"
                  >
                    Lihat Detail
                  </button>
                </td>
              </tr>
            ))}
            {data?.users.length === 0 && (
              <tr><td colSpan={4} className="text-center text-text-secondary py-8">Belum ada penyewa tercatat.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedTenant && (
        <TenantDetailModal tenant={selectedTenant} onClose={() => setSelectedTenant(null)} />
      )}
    </div>
  )
}

function TenantDetailModal({ tenant, onClose }: { tenant: TenantUser; onClose: () => void }) {
  const { data } = useTenantDetail(tenant.id)
  const updateProfile = useUpdateTenantProfile()

  const [form, setForm] = useState({
    id_number: "", address: "", emergency_contact_name: "",
    emergency_contact_phone: "", occupation: "", staff_note: "",
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (data?.profile) {
      setForm({
        id_number: data.profile.id_number ?? "",
        address: data.profile.address ?? "",
        emergency_contact_name: data.profile.emergency_contact_name ?? "",
        emergency_contact_phone: data.profile.emergency_contact_phone ?? "",
        occupation: data.profile.occupation ?? "",
        staff_note: data.profile.staff_note ?? "",
      })
    }
  }, [data])

  const handleSave = () => {
    updateProfile.mutate(
      { userId: tenant.id, ...form },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000) } }
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6 py-10 overflow-y-auto">
      <div className="bg-card rounded-2xl p-6 w-full max-w-lg relative my-auto max-h-[85vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={18} className="text-primary" />
          </div>
          <div>
            <p className="font-heading font-semibold text-text">{tenant.name}</p>
            <p className="text-xs text-text-secondary">{tenant.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <input placeholder="No. KTP/Identitas" value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} className="border border-border rounded-lg px-4 py-2.5 text-sm" />
          <input placeholder="Pekerjaan/Institusi" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} className="border border-border rounded-lg px-4 py-2.5 text-sm" />
          <input placeholder="Kontak Darurat (Nama)" value={form.emergency_contact_name} onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })} className="border border-border rounded-lg px-4 py-2.5 text-sm" />
          <input placeholder="Kontak Darurat (No. HP)" value={form.emergency_contact_phone} onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })} className="border border-border rounded-lg px-4 py-2.5 text-sm" />
          <textarea placeholder="Alamat lengkap" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="col-span-2 border border-border rounded-lg px-4 py-2.5 text-sm resize-none" />
          <textarea placeholder="Catatan staff (opsional)" value={form.staff_note} onChange={(e) => setForm({ ...form, staff_note: e.target.value })} rows={2} className="col-span-2 border border-border rounded-lg px-4 py-2.5 text-sm resize-none" />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="font-heading font-medium text-sm bg-primary text-white rounded-lg px-5 py-2.5 disabled:opacity-60"
          >
            {updateProfile.isPending ? "Menyimpan..." : "Simpan Data"}
          </button>
          {saved && <span className="flex items-center gap-1.5 text-primary text-sm"><CheckCircle2 size={15} /> Tersimpan</span>}
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-sm font-heading font-semibold text-text mb-3">Riwayat Booking di Cabang Ini</p>
          <div className="space-y-2">
            {data?.history.map((h) => (
              <div key={h.id} className="flex items-center justify-between text-sm bg-section rounded-lg px-4 py-2.5">
                <div>
                  <p className="text-text">{h.room?.room_number} · {h.duration_months} bulan</p>
                  <p className="text-xs text-text-secondary">{new Date(h.check_in).toLocaleDateString("id-ID")}</p>
                </div>
                <span className="text-xs text-text-secondary">{statusLabel[h.status] ?? h.status}</span>
              </div>
            ))}
            {data?.history.length === 0 && (
              <p className="text-xs text-text-secondary">Belum ada riwayat booking.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}