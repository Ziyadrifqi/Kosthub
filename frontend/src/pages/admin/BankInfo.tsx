import { useState } from "react"
import { Plus, Pencil, Trash2, X, Landmark, Power } from "lucide-react"
import {
  useAllBankAccounts,
  useCreateBankAccount,
  useUpdateBankAccount,
  useToggleBankAccount,
  useDeleteBankAccount,
  type BankAccount,
} from "@/hooks/useBankAccounts"
import { usePageTitle } from "@/hooks/usePageTitle"

const emptyForm = { bank_name: "", account_number: "", account_holder: "", note: "" }

export default function BankInfo() {
  usePageTitle("Rekening Pembayaran")
  const { data: accounts } = useAllBankAccounts()
  const createAccount = useCreateBankAccount()
  const updateAccount = useUpdateBankAccount()
  const toggleAccount = useToggleBankAccount()
  const deleteAccount = useDeleteBankAccount()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (acc: BankAccount) => {
    setEditingId(acc.id)
    setForm({ bank_name: acc.bank_name, account_number: acc.account_number, account_holder: acc.account_holder, note: acc.note ?? "" })
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateAccount.mutate({ id: editingId, ...form }, { onSuccess: () => setShowForm(false) })
    } else {
      createAccount.mutate(form, { onSuccess: () => setShowForm(false) })
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Landmark size={20} className="text-primary" />
          <h1 className="font-heading font-extrabold text-2xl text-text">Rekening Pembayaran</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 font-heading font-medium text-sm bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 transition-colors"
        >
          <Plus size={16} /> Tambah Rekening
        </button>
      </div>
      <p className="text-text-secondary mb-8">
        Semua rekening aktif muncul di halaman upload bukti transfer customer, ditampilkan sebagai pilihan.
      </p>

      <div className="space-y-3 max-w-lg">
        {accounts?.map((acc) => (
          <div key={acc.id} className={`bg-card border border-border rounded-2xl p-5 ${!acc.is_active ? "opacity-50" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-heading font-semibold text-text">{acc.bank_name}</p>
                  {!acc.is_active && (
                    <span className="text-[10px] font-heading font-semibold bg-section text-text-secondary px-2 py-0.5 rounded-full">
                      Nonaktif
                    </span>
                  )}
                </div>
                <p className="font-mono text-sm text-text mt-1">{acc.account_number}</p>
                <p className="text-sm text-text-secondary">a.n. {acc.account_holder}</p>
                {acc.note && <p className="text-xs text-text-secondary mt-2">{acc.note}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => toggleAccount.mutate(acc.id)}
                  title={acc.is_active ? "Nonaktifkan" : "Aktifkan"}
                  className="p-1.5 text-text-secondary hover:text-primary transition-colors"
                >
                  <Power size={15} />
                </button>
                <button onClick={() => openEdit(acc)} className="p-1.5 text-text-secondary hover:text-primary transition-colors">
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => confirm(`Hapus rekening ${acc.bank_name}?`) && deleteAccount.mutate(acc.id)}
                  className="p-1.5 text-text-secondary hover:text-error transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {accounts?.length === 0 && (
          <div className="text-center text-text-secondary py-12 bg-card border border-border rounded-2xl">
            Belum ada rekening. Tambahkan minimal 1 supaya customer bisa upload bukti transfer.
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-text-secondary hover:text-text">
              <X size={20} />
            </button>
            <h3 className="font-heading font-bold text-lg text-text mb-4">
              {editingId ? "Edit Rekening" : "Tambah Rekening"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Nama Bank (mis. BCA)" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} required className="w-full border border-border rounded-lg px-4 py-2.5 text-sm" />
              <input placeholder="Nomor Rekening" value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} required className="w-full border border-border rounded-lg px-4 py-2.5 text-sm" />
              <input placeholder="Atas Nama" value={form.account_holder} onChange={(e) => setForm({ ...form, account_holder: e.target.value })} required className="w-full border border-border rounded-lg px-4 py-2.5 text-sm" />
              <textarea placeholder="Catatan (opsional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm resize-none" />

              <button type="submit" disabled={createAccount.isPending || updateAccount.isPending} className="w-full font-heading font-medium text-sm bg-primary text-white rounded-lg py-2.5 disabled:opacity-60">
                {createAccount.isPending || updateAccount.isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}