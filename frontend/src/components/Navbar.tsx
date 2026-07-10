import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

const navLinks = [
  { label: "Cari Kost", to: "/rooms" },
  { label: "Cara Kerja", to: "/#cara-kerja" },
  { label: "Bantuan", to: "/help" },
]

export function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="font-heading font-extrabold text-xl text-text">
          Kost<span className="text-primary">Hub</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-heading font-semibold text-sm text-text-secondary">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
          {user && (
            <Link to="/my-bookings" className="hover:text-primary transition-colors">Booking Saya</Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-text-secondary">Hi, {user.name.split(" ")[0]}</span>
              <button
                onClick={handleLogout}
                className="font-heading font-medium text-sm border border-border rounded-lg px-4 py-2 hover:bg-section transition-colors"
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
                className="font-heading font-medium text-sm bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 transition-colors"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-text" onClick={() => setOpen(!open)} aria-label="Menu">
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
              className="block font-heading font-medium text-sm text-text py-1.5"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {user ? (
              <button onClick={handleLogout} className="font-heading font-medium text-sm text-left py-1.5">
                Keluar
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="font-heading font-medium text-sm py-1.5">Masuk</Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="font-heading font-medium text-sm bg-primary text-white rounded-lg px-4 py-2 text-center"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}