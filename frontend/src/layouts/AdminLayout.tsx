import { useState } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { roleMenus, roleThemes } from "@/config/roleMenus"
import { ConfirmModal } from "@/components/ConfirmModal"

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const roleName = user?.role?.name ?? "staff"
  const menu = roleMenus[roleName] ?? []
  const theme = roleThemes[roleName] ?? roleThemes.staff

  const handleLogout = () => {
    logout()
    navigate("/")
    setShowLogoutConfirm(false)
  }

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="px-6 py-5 border-b border-border">
          <Link to="/admin" className="font-heading font-extrabold text-lg text-text">
            Kost<span className="text-primary">Hub</span>
          </Link>
          <span className={`inline-block mt-2 text-xs font-heading font-semibold px-2.5 py-1 rounded-full ${theme.accentBg} ${theme.accent}`}>
            {theme.badge}
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {menu.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-heading font-medium transition-colors ${
                  active ? `${theme.accentBg} ${theme.accent}` : "text-text-secondary hover:bg-section"
                }`}
              >
                <item.icon size={18} /> {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <div className="px-3 mb-2">
            <p className="text-sm font-heading font-semibold text-text">{user?.name}</p>
            <p className="text-xs text-text-secondary">{user?.email}</p>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-heading font-medium text-error hover:bg-error/10 transition-colors w-full"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <ConfirmModal
        open={showLogoutConfirm}
        title="Keluar dari akun?"
        message="Kamu yakin mau keluar dari dashboard? Sesi kamu akan diakhiri."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  )
}