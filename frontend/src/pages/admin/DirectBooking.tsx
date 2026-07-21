import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2 } from "lucide-react"
import { api } from "@/lib/api"
import { useRooms } from "@/hooks/useRooms"
import { useAuthStore } from "@/store/authStore"

export default function DirectBooking() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const { data } = useRooms({ page: 1, limit: 50, status: "available", branch_id: user?.branch_id })

  const [form, setForm] = useState({
    room_id: "", check_in: "", duration_months: 1,
    customer_email: "", customer_name: "", customer_phone: "", payment_note: "",
  })

  const createDirect = useMutation({
    mutationFn: async () => {
      await api.post("/staff/bookings/direct", {
        room_id: Number(form.room_id),
        check_in: form.check_in,
        duration_months: form.duration_months,
        customer_email: form.customer_email,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        payment_note: form.payment_note,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      setForm({ room_id: "", check_in: "", duration_months: 1, customer_email: "", customer_name: "", customer_phone: "", payment_note: "" })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createDirect.mutate()
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="font-heading font-extrabold text-2xl text-text mb-1">Booking Langsung</h1>
      <p className="text-text-secondary mb-8">
        Untuk customer yang datang & bayar tunai langsung di lokasi. Booking otomatis terkonfirmasi.
      </p>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Pilih Kamar (tersedia)</label>
          <select
            value={form.room_id}
            onChange={(e) => setForm({ ...form, room_id: e.target.value })}
            required
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm"
          >
            <option value="">Pilih kamar</option>
            {data?.rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.room_number} — Rp{r.price.toLocaleString("id-ID")}/bln</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Tanggal Check-in</label>
            <input type="date" required value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Durasi (bulan)</label>
            <input type="number" min={1} required value={form.duration_months}
              onChange={(e) => setForm({ ...form, duration_months: Number(e.target.value) })}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm" />
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-sm font-heading font-semibold text-text mb-3">Data Customer</p>
          <div className="space-y-3">
            <input placeholder="Email" type="email" required value={form.customer_email}
              onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm" />
            <p className="text-xs text-text-secondary -mt-2">Kalau email sudah terdaftar, otomatis dipakai. Kalau belum, akun baru dibuat.</p>
            <input placeholder="Nama Lengkap" required value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm" />
            <input placeholder="No. HP" value={form.customer_phone}
              onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Catatan Pembayaran (opsional)</label>
          <input placeholder="mis. Bayar tunai di kasir" value={form.payment_note}
            onChange={(e) => setForm({ ...form, payment_note: e.target.value })}
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm" />
        </div>

        {createDirect.isError && (
          <p className="text-error text-xs">Gagal membuat booking. Cek kembali data yang diisi.</p>
        )}
        {createDirect.isSuccess && (
          <p className="flex items-center gap-1.5 text-primary text-sm">
            <CheckCircle2 size={15} /> Booking berhasil dibuat & langsung terkonfirmasi.
          </p>
        )}

        <button type="submit" disabled={createDirect.isPending}
          className="w-full font-heading font-medium text-sm bg-primary text-white rounded-lg py-2.5 disabled:opacity-60">
          {createDirect.isPending ? "Memproses..." : "Buat Booking & Catat Pembayaran"}
        </button>
      </form>
    </div>
  )
}