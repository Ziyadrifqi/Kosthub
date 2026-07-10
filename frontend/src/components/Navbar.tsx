import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

export function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

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
          <Link to="/rooms" className="hover:text-primary transition-colors">Cari Kost</Link>
          {user && (
            <Link to="/my-bookings" className="hover:text-primary transition-colors">Booking Saya</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:block text-sm text-text-secondary">Hi, {user.name.split(" ")[0]}</span>
              <button
                onClick={handleLogout}
                className="font-heading font-medium text-sm border border-border rounded-lg px-4 py-2 hover:bg-section transition-colors"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-heading font-medium text-sm px-4 py-2 hover:text-primary transition-colors"
              >
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
      </nav>
    </header>
  )
}