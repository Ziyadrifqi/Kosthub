import { useState, useEffect } from "react"
import { CheckCircle2 } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useUpdateProfile, useChangePassword } from "@/hooks/useProfile"
import { Link } from "react-router-dom"
import { usePageTitle } from "@/hooks/usePageTitle"
import { useMyTenantProfile, useUpdateMyTenantProfile } from "@/hooks/useMyTenantProfile"

export default function Profile() {
  usePageTitle("Profil Saya")
  const { user } = useAuthStore()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  const [name, setName] = useState(user?.name ?? "")
  const [phone, setPhone] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  // ===== Data Tambahan Penyewaan (Tenant Profile) =====
  const { data: tenantProfile } = useMyTenantProfile()
  const updateTenantProfile = useUpdateMyTenantProfile()
  const [tenantForm, setTenantForm] = useState({
    id_number: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    occupation: "",
  })

  useEffect(() => {
    if (tenantProfile) {
      setTenantForm({
        id_number: tenantProfile.id_number ?? "",
        address: tenantProfile.address ?? "",
        emergency_contact_name: tenantProfile.emergency_contact_name ?? "",
        emergency_contact_phone: tenantProfile.emergency_contact_phone ?? "",
        occupation: tenantProfile.occupation ?? "",
      })
    }
  }, [tenantProfile])

  const handleTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateTenantProfile.mutate(tenantForm)
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate({ name, phone })
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    changePassword.mutate(
      { current_password: currentPassword, new_password: newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("")
          setNewPassword("")
        },
      }
    )
  }

  return (
    <section className="max-w-2xl mx-auto px-6 py-14 space-y-8 bg-paper">
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-primary">Akun</span>
        <h1 className="font-heading font-medium text-2xl text-ink mt-1">Profil Saya</h1>
        <p className="text-text-secondary mt-1">Kelola informasi akun kamu.</p>
      </div>

      <form onSubmit={handleProfileSubmit} className="relative bg-card border border-border rounded-md p-6 space-y-4">
        <span className="absolute -top-2.5 left-6 w-3 h-3 rounded-full bg-brass shadow-sm ring-2 ring-card" />
        <h2 className="font-heading font-medium text-ink">Informasi Akun</h2>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">Nama Lengkap</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">Email</label>
          <input
            value={user?.email}
            disabled
            className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-section text-text-secondary cursor-not-allowed"
          />
          <p className="text-xs text-text-secondary mt-1">Email tidak dapat diubah.</p>
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">No. HP</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08123456789"
            className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>

        {updateProfile.isSuccess && (
          <p className="flex items-center gap-1.5 text-primary text-sm">
            <CheckCircle2 size={15} /> Profil berhasil diperbarui.
          </p>
        )}

        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="font-heading font-medium text-sm bg-ink hover:bg-primary text-paper rounded-sm px-5 py-2.5 transition-colors disabled:opacity-60"
        >
          {updateProfile.isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>

      {/* ===== Data Tambahan Penyewaan ===== */}
      <form onSubmit={handleTenantSubmit} className="relative bg-card border border-border rounded-md p-6 space-y-4">
        <span className="absolute -top-2.5 left-6 w-3 h-3 rounded-full bg-brass shadow-sm ring-2 ring-card" />
        <div>
          <h2 className="font-heading font-medium text-ink">Data Tambahan Penyewaan</h2>
          <p className="text-xs text-text-secondary mt-1">
            Opsional, tapi disarankan diisi sebelum check-in supaya proses lebih cepat di lokasi.
          </p>
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">No. KTP/Identitas</label>
          <input
            value={tenantForm.id_number}
            onChange={(e) => setTenantForm({ ...tenantForm, id_number: e.target.value })}
            className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">Alamat Lengkap</label>
          <textarea
            value={tenantForm.address}
            onChange={(e) => setTenantForm({ ...tenantForm, address: e.target.value })}
            rows={2}
            className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">Pekerjaan/Institusi</label>
          <input
            value={tenantForm.occupation}
            onChange={(e) => setTenantForm({ ...tenantForm, occupation: e.target.value })}
            className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">
              Kontak Darurat — Nama
            </label>
            <input
              value={tenantForm.emergency_contact_name}
              onChange={(e) => setTenantForm({ ...tenantForm, emergency_contact_name: e.target.value })}
              placeholder="Bukan nomor kamu sendiri"
              className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">
              Kontak Darurat — No. HP
            </label>
            <input
              value={tenantForm.emergency_contact_phone}
              onChange={(e) => setTenantForm({ ...tenantForm, emergency_contact_phone: e.target.value })}
              placeholder="Keluarga/kerabat terdekat"
              className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>
        <p className="text-xs text-text-secondary -mt-2">
          Ini nomor orang lain yang bisa dihubungi kalau terjadi keadaan darurat — bukan nomor kamu sendiri (nomor pribadimu sudah tercatat di bagian atas).
        </p>
        {updateTenantProfile.isSuccess && (
          <p className="flex items-center gap-1.5 text-primary text-sm">
            <CheckCircle2 size={15} /> Data tersimpan.
          </p>
        )}
        <button
          type="submit"
          disabled={updateTenantProfile.isPending}
          className="font-heading font-medium text-sm bg-ink hover:bg-primary text-paper rounded-sm px-5 py-2.5 transition-colors disabled:opacity-60"
        >
          {updateTenantProfile.isPending ? "Menyimpan..." : "Simpan Data"}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="relative bg-card border border-border rounded-md p-6 space-y-4">
        <span className="absolute -top-2.5 left-6 w-3 h-3 rounded-full bg-brass shadow-sm ring-2 ring-card" />
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-medium text-ink">Ganti Kata Sandi</h2>
          <Link to="/forgot-password" className="text-xs text-primary hover:underline">
            Lupa kata sandi saat ini?
          </Link>
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">Kata Sandi Saat Ini</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">Kata Sandi Baru</label>
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>

        {changePassword.isError && (
          <p className="text-clay text-sm font-mono">
            {(changePassword.error as any)?.response?.data?.error ?? "Gagal mengganti kata sandi."}
          </p>
        )}
        {changePassword.isSuccess && (
          <p className="flex items-center gap-1.5 text-primary text-sm">
            <CheckCircle2 size={15} /> Kata sandi berhasil diubah.
          </p>
        )}

        <button
          type="submit"
          disabled={changePassword.isPending}
          className="font-heading font-medium text-sm border border-border rounded-sm px-5 py-2.5 hover:bg-section transition-colors disabled:opacity-60"
        >
          {changePassword.isPending ? "Memproses..." : "Ganti Kata Sandi"}
        </button>
      </form>
    </section>
  )
}