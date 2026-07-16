import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { NotificationBell } from "@/components/NotificationBell"
import { ConfirmModal } from "@/components/ConfirmModal"
import { branches } from "@/lib/branches"


const navLinks = [
  { label: "Cari Kamar", to: "/rooms" },
  { label: "Bantuan", to: "/help" },
]

export function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  const handleLogout = () => {
    logout()
    navigate("/")
    setShowLogoutConfirm(false)
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b border-border">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="font-heading font-medium text-xl text-ink">
          KostHub
        </Link>

        <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wide text-text-secondary">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
          {user && (
  <>
    <Link to="/my-bookings" className="hover:text-primary transition-colors">Booking Saya</Link>
    <Link to="/favorites" className="hover:text-primary transition-colors">Favorit</Link>
    <Link to="/profile" className="hover:text-primary transition-colors">Profil</Link>
    {user.role && ["staff", "owner", "super_admin"].includes(user.role.name) && (
      <Link to="/admin" className="text-primary hover:underline">Panel Admin</Link>
    )}
  </>
)}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <span className="text-sm text-text-secondary">Hi, {user.name.split(" ")[0]}</span>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="font-heading font-medium text-sm border border-border rounded-sm px-4 py-2 hover:bg-section transition-colors"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-heading font-medium text-sm px-4 py-2 hover:text-primary transition-colors">
                Masuk
              </Link>
              <Link
                to="/register"
                className="font-heading font-medium text-sm bg-ink hover:bg-primary text-paper rounded-sm px-4 py-2 transition-colors"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-ink" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-border bg-card px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block font-heading font-medium text-sm text-ink py-1.5"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 border-t border-border">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-secondary mb-2">Cabang</p>
            <div className="flex flex-wrap gap-2">
              {branches.map((b) => (
                <Link
                  key={b.code}
                  to={`/rooms?branch=${b.code}`}
                  onClick={() => setOpen(false)}
                  className="text-xs font-mono border border-border rounded-sm px-2.5 py-1 hover:border-primary hover:text-primary transition-colors"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
           {user ? (
  <>
    <Link to="/my-bookings" onClick={() => setOpen(false)} className="font-heading font-medium text-sm text-ink py-1.5">Booking Saya</Link>
    <Link to="/favorites" onClick={() => setOpen(false)} className="font-heading font-medium text-sm text-ink py-1.5">Favorit</Link>
    <Link to="/profile" onClick={() => setOpen(false)} className="font-heading font-medium text-sm text-ink py-1.5">Profil</Link>
    {user.role && ["staff", "owner", "super_admin"].includes(user.role.name) && (
      <Link to="/admin" onClick={() => setOpen(false)} className="font-heading font-medium text-sm text-primary py-1.5">Panel Admin</Link>
    )}
    <button onClick={() => setShowLogoutConfirm(true)} className="font-heading font-medium text-sm text-left py-1.5">
      Keluar
    </button>
  </>
) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="font-heading font-medium text-sm py-1.5">Masuk</Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="font-heading font-medium text-sm bg-ink text-paper rounded-sm px-4 py-2 text-center"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={showLogoutConfirm}
        title="Keluar dari akun?"
        message="Kamu yakin mau keluar? Kamu perlu login lagi untuk mengakses akun ini."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </header>
  )
}