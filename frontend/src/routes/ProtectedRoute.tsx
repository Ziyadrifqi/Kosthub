import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}

export function AdminRoute() {
  const { token, user } = useAuthStore()
  const location = useLocation()

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />

  const adminRoles = ["staff", "owner", "super_admin"]
  if (!user?.role || !adminRoles.includes(user.role.name)) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

export function RoleRoute({ allowedRoles }: { allowedRoles: string[] }) {
  const { token, user } = useAuthStore()
  const location = useLocation()

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />
  if (!user?.role || !allowedRoles.includes(user.role.name)) {
    return <Navigate to="/admin" replace />
  }
  return <Outlet />
}