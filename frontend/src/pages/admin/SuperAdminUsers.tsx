import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface UserRow {
  id: string
  name: string
  email: string
  role?: { name: string }
}

const roles = ["customer", "staff", "finance", "owner", "super_admin"]

export default function SuperAdminUsers() {
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const res = await api.get<{ users: UserRow[] }>("/super-admin/users")
      return res.data
    },
  })

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      await api.patch(`/super-admin/users/${id}/role`, { role_name: role })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-users"] }),
  })

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
            </tr>
          </thead>
          <tbody>
            {data?.users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-5 py-3 text-text">{u.name}</td>
                <td className="px-5 py-3 text-text-secondary">{u.email}</td>
                <td className="px-5 py-3">
                  <select
                    value={u.role?.name ?? "customer"}
                    onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value })}
                    className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}