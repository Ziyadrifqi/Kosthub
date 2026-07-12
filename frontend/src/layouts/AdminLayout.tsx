import { useState } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { LogOut, Menu, X } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { roleMenus, roleThemes } from "@/config/roleMenus"
import { ConfirmModal } from "@/components/ConfirmModal"

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
      {/* Overlay saat menu mobile terbuka */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar: fixed & slide-in di mobile, static di md+ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col
          transform transition-transform duration-200 ease-in-out
          md:static md:translate-x-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <Link to="/admin" className="font-heading font-extrabold text-lg text-text" onClick={() => setMobileMenuOpen(false)}>
            Kost<span className="text-primary">Hub</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-text-secondary hover:text-text">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pt-3">
          <span className={`inline-block text-xs font-heading font-semibold px-2.5 py-1 rounded-full ${theme.accentBg} ${theme.accent}`}>
            {theme.badge}
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menu.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
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
            <p className="text-sm font-heading font-semibold text-text truncate">{user?.name}</p>
            <p className="text-xs text-text-secondary truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-heading font-medium text-error hover:bg-error/10 transition-colors w-full"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar cuma muncul di mobile buat toggle sidebar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-0 z-30">
          <button onClick={() => setMobileMenuOpen(true)} className="text-text-secondary hover:text-text">
            <Menu size={22} />
          </button>
          <span className="font-heading font-extrabold text-text">
            Kost<span className="text-primary">Hub</span>
          </span>
          <span className="w-[22px]" /> {/* spacer biar judul center */}
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

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