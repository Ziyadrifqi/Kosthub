import { useState } from "react"
import { Wallet, Banknote, CreditCard, Download } from "lucide-react"
import { useTransactions } from "@/hooks/useTransactions"
import { useBranches } from "@/hooks/useBranches"
import { usePageTitle } from "@/hooks/usePageTitle"
import { ExportModal } from "@/components/ExportModal"

const methodLabel: Record<string, { text: string; icon: typeof Banknote; class: string }> = {
  manual_transfer: { text: "Transfer", icon: CreditCard, class: "bg-info/10 text-info" },
  cash: { text: "Tunai", icon: Banknote, class: "bg-warning/10 text-warning" },
}

export default function OwnerTransactions() {
  usePageTitle("Riwayat Transaksi")

  const { data: branches } = useBranches()
  const [method, setMethod] = useState("")
  const [branchId, setBranchId] = useState<number | undefined>()
  const [page, setPage] = useState(1)
  const [showExport, setShowExport] = useState(false)

  const { data } = useTransactions(method, branchId, page)
  const totalPages = data ? Math.ceil(data.total / 20) : 1
  const hasData = !!data && data.total > 0

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Wallet size={20} className="text-primary" />
          <h1 className="font-heading font-extrabold text-2xl text-text">Riwayat Transaksi</h1>
        </div>
        <button
          onClick={() => setShowExport(true)}
          disabled={!hasData}
          title={!hasData ? "Tidak ada data untuk diexport" : undefined}
          className="flex items-center gap-2 font-heading font-medium text-sm border border-border rounded-lg px-4 py-2 hover:bg-section transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <Download size={15} /> Export Excel
        </button>
      </div>
      <p className="text-text-secondary mb-6">
        Semua pembayaran terverifikasi, untuk rekonsiliasi transfer bank & kas tunai per cabang.
      </p>

      {data && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 mb-6">
          <p className="text-sm text-text-secondary">Total ({data.total} transaksi, filter aktif)</p>
          <p className="font-heading font-extrabold text-2xl text-primary">
            Rp{data.sum_total.toLocaleString("id-ID")}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={method}
          onChange={(e) => { setMethod(e.target.value); setPage(1) }}
          className="border border-border rounded-lg px-4 py-2.5 text-sm"
        >
          <option value="">Semua Metode</option>
          <option value="manual_transfer">Transfer</option>
          <option value="cash">Tunai</option>
        </select>

        <select
          value={branchId ?? ""}
          onChange={(e) => { setBranchId(Number(e.target.value) || undefined); setPage(1) }}
          className="border border-border rounded-lg px-4 py-2.5 text-sm"
        >
          <option value="">Semua Cabang</option>
          {branches?.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-section text-text-secondary font-heading font-semibold">
            <tr>
              <th className="text-left px-5 py-3">Customer</th>
              <th className="text-left px-5 py-3">Kamar</th>
              <th className="text-left px-5 py-3">Cabang</th>
              <th className="text-left px-5 py-3">Metode</th>
              <th className="text-left px-5 py-3">Jumlah</th>
              <th className="text-left px-5 py-3">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {data?.payments.map((p) => {
              const m = methodLabel[p.method] ?? { text: p.method, icon: Wallet, class: "bg-section text-text-secondary" }
              const Icon = m.icon
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-5 py-3 text-text">{p.booking?.user?.name}</td>
                  <td className="px-5 py-3 text-text-secondary">{p.booking?.room?.room_number}</td>
                  <td className="px-5 py-3 text-text-secondary">{p.booking?.room?.branch?.name}</td>
                  <td className="px-5 py-3">
                    <span className={`flex items-center gap-1.5 w-fit text-xs font-heading font-semibold px-2.5 py-1 rounded-full ${m.class}`}>
                      <Icon size={12} /> {m.text}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-heading font-semibold text-text">Rp{p.amount.toLocaleString("id-ID")}</td>
                  <td className="px-5 py-3 text-text-secondary text-xs">{new Date(p.updated_at).toLocaleDateString("id-ID")}</td>
                </tr>
              )
            })}
            {data?.payments.length === 0 && (
              <tr><td colSpan={6} className="text-center text-text-secondary py-8">Tidak ada transaksi.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="font-heading font-medium text-sm border border-border rounded-lg px-4 py-2 disabled:opacity-40">Sebelumnya</button>
          <span className="text-sm text-text-secondary">Halaman {page} dari {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="font-heading font-medium text-sm border border-border rounded-lg px-4 py-2 disabled:opacity-40">Berikutnya</button>
        </div>
      )}

      {showExport && (
        <ExportModal method={method} branchId={branchId} onClose={() => setShowExport(false)} />
      )}
    </div>
  )
}