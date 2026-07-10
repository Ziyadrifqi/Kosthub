import { useAuthStore } from "@/store/authStore"
import { usePendingPayments } from "@/hooks/useAdminPayments"
import { useReportSummary } from "@/hooks/useReports"

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const role = user?.role?.name

  const { data: pending } = usePendingPayments()
  const { data: summary } = useReportSummary()

  return (
    <div className="p-8">
      <h1 className="font-heading font-extrabold text-2xl text-text mb-1">
        Halo, {user?.name?.split(" ")[0]} 👋
      </h1>
      <p className="text-text-secondary mb-8">Berikut ringkasan sesuai peranmu.</p>

      <div className="grid sm:grid-cols-3 gap-4">
        {(role === "finance" || role === "super_admin") && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm text-text-secondary">Payment Menunggu Verifikasi</p>
            <p className="font-heading font-extrabold text-3xl text-warning mt-2">{pending?.total ?? 0}</p>
          </div>
        )}

        {(role === "owner" || role === "super_admin") && summary && (
          <>
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-sm text-text-secondary">Total Revenue</p>
              <p className="font-heading font-extrabold text-2xl text-primary mt-2">
                Rp{summary.total_revenue.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-sm text-text-secondary">Okupansi Kamar</p>
              <p className="font-heading font-extrabold text-2xl text-text mt-2">
                {summary.occupied_rooms}/{summary.total_rooms}
              </p>
            </div>
          </>
        )}

        {(role === "staff" || role === "super_admin") && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm text-text-secondary">Peran Kamu</p>
            <p className="font-heading font-extrabold text-2xl text-secondary mt-2">Operasional Kamar</p>
          </div>
        )}
      </div>
    </div>
  )
}