import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}

export function AdminRoute() {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  const adminRoles = ["staff", "finance", "owner", "super_admin"]
  if (!user?.role || !adminRoles.includes(user.role.name)) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}