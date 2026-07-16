import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { Loader2 } from "lucide-react"

const ADMIN_ROLES = ["staff", "owner", "super_admin"]

// SessionGate menjaga 3 hal sebelum halaman apapun dirender:
// 1. Tunggu Zustand selesai baca ulang data dari localStorage (hydration)
// 2. Deteksi data user yang "rusak" (misal role bukan object) — paksa logout
//    daripada nampilin UI yang salah
// 3. Validasi token masih hidup ke backend, dan arahkan admin-level yang
//    membuka "/" langsung ke "/admin"
export function SessionGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated())
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    return unsub
  }, [])

  useEffect(() => {
    if (!hydrated) return

    const token = useAuthStore.getState().token
    const user = useAuthStore.getState().user

    if (!token) {
      setChecking(false)
      return
    }

    // Pengaman: kalau role tersimpan bukan object yang benar (misal string polos
    // dari bug lama / data korup), paksa logout daripada nampilin UI yang salah.
    if (user?.role !== undefined && user?.role !== null && typeof user.role !== "object") {
      useAuthStore.getState().logout()
      setChecking(false)
      return
    }

    api
      .get("/me")
      .then(() => {
        const role = user?.role?.name
        if (location.pathname === "/" && role && ADMIN_ROLES.includes(role)) {
          navigate("/admin", { replace: true })
        }
      })
      .catch(() => {
        useAuthStore.getState().logout()
      })
      .finally(() => setChecking(false))
  }, [hydrated]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!hydrated || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    )
  }

  return <>{children}</>
}