import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UserX } from "lucide-react"
import { api } from "@/lib/api"
import { branches } from "@/lib/branches"

interface UserRow {
  id: string
  name: string
  email: string
  role?: { name: string }
  branch_id?: number
}

const roles = ["customer", "staff", "owner", "super_admin"]

export default function SuperAdminUsers() {
  const queryClient = useQueryClient()
  const [pendingBranch, setPendingBranch] = useState<Record<string, number | undefined>>({})

  const { data } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const res = await api.get<{ users: UserRow[] }>("/super-admin/users")
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
      // jangan langsung submit — tunggu admin pilih cabang dulu
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

  return (
    <div className="p-8">
      <h1 className="font-heading font-extrabold text-2xl text-text mb-8">Kelola User & Role</h1>

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
                          {branches.map((b) => (
                            <option key={b.code} value={b.id}>{b.name}</option>
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
    </div>
  )
}