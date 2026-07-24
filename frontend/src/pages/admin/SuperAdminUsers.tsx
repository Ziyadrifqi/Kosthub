import { useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Search, UserX } from "lucide-react"
import { api } from "@/lib/api"
import { useBranches } from "@/hooks/useBranches"
import { usePageTitle } from "@/hooks/usePageTitle"

interface UserRow {
  id: string
  name: string
  email: string
  role?: { name: string }
  branch_id?: number
}

interface UserListResponse {
  users: UserRow[]
  total: number
  page: number
  limit: number
}

const roles = ["customer", "staff", "owner", "super_admin"]
const LIMIT = 10

export default function SuperAdminUsers() {
  usePageTitle("Kelola User")

  const queryClient = useQueryClient()
  const { data: branches } = useBranches()
  const [pendingBranch, setPendingBranch] = useState<Record<string, number | undefined>>({})

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const { data, isLoading } = useQuery({
    queryKey: ["all-users", page, debouncedSearch],
    queryFn: async () => {
      const res = await api.get<UserListResponse>("/super-admin/users", {
        params: { page, limit: LIMIT, search: debouncedSearch || undefined },
      })
      return res.data
    },
  })

  const updateRole = useMutation({
    mutationFn: async ({ id, role, branchId }: { id: string; role: string; branchId?: number }) => {
      await api.patch(`/super-admin/users/${id}/role`, { role_name: role, branch_id: branchId ?? null })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-users"] }),
  })

  const deactivateUser = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/super-admin/users/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-users"] }),
  })

  const handleRoleChange = (user: UserRow, newRole: string) => {
    if (newRole === "staff") {
      setPendingBranch({ ...pendingBranch, [user.id]: user.branch_id })
      return
    }
    updateRole.mutate({ id: user.id, role: newRole })
  }

  const handleConfirmStaffBranch = (userId: string) => {
    const branchId = pendingBranch[userId]
    if (!branchId) return
    updateRole.mutate({ id: userId, role: "staff", branchId })
    setPendingBranch((prev) => {
      const next = { ...prev }
      delete next[userId]
      return next
    })
  }

  const handleDeactivate = (user: UserRow) => {
    if (confirm(`Nonaktifkan akun "${user.name}"? User tidak akan bisa login lagi.`)) {
      deactivateUser.mutate(user.id)
    }
  }

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  return (
    <div className="p-8">
      <h1 className="font-heading font-extrabold text-2xl text-text mb-1">Kelola User & Role</h1>
      <p className="text-text-secondary mb-6">
        {data ? `${data.total} user terdaftar` : "Memuat..."}
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
              <th className="text-left px-5 py-3">Role</th>
              <th className="text-left px-5 py-3">Cabang</th>
              <th className="text-left px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="text-center text-text-secondary py-8">Memuat data...</td></tr>
            )}

            {data?.users.length === 0 && (
              <tr><td colSpan={5} className="text-center text-text-secondary py-8">Tidak ada user yang cocok.</td></tr>
            )}

            {data?.users.map((u) => {
              const currentRole = u.role?.name ?? "customer"
              const isChoosingBranch = currentRole !== "staff" && pendingBranch[u.id] !== undefined
              const showBranchSelector = currentRole === "staff" || pendingBranch[u.id] !== undefined

              return (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-5 py-3 text-text">{u.name}</td>
                  <td className="px-5 py-3 text-text-secondary">{u.email}</td>
                  <td className="px-5 py-3">
                    <select
                      value={isChoosingBranch ? "staff" : currentRole}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    {showBranchSelector ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={pendingBranch[u.id] ?? u.branch_id ?? ""}
                          onChange={(e) =>
                            setPendingBranch({ ...pendingBranch, [u.id]: Number(e.target.value) || undefined })
                          }
                          className="border border-border rounded-lg px-3 py-1.5 text-sm"
                        >
                          <option value="">Pilih cabang</option>
                          {branches?.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                        {pendingBranch[u.id] !== undefined && (
                          <button
                            onClick={() => handleConfirmStaffBranch(u.id)}
                            className="text-xs font-heading font-medium text-primary hover:underline"
                          >
                            Simpan
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-text-secondary text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDeactivate(u)}
                      className="flex items-center gap-1.5 text-xs font-heading font-medium text-error hover:underline"
                    >
                      <UserX size={14} /> Nonaktifkan
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {data && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="font-heading font-medium text-sm border border-border rounded-lg px-4 py-2 disabled:opacity-40 hover:bg-section transition-colors"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-text-secondary">Halaman {page} dari {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="font-heading font-medium text-sm border border-border rounded-lg px-4 py-2 disabled:opacity-40 hover:bg-section transition-colors"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  )
}