import { Outlet } from "react-router-dom"
import { Navbar } from "@/components/Navbar"

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-text-secondary">
        © {new Date().getFullYear()} KostHub. Semua hak dilindungi.
      </footer>
    </div>
  )
}