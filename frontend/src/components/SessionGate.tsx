import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { Loader2 } from "lucide-react"

// Memvalidasi token ke backend SEBELUM halaman apapun dirender.
// Ini mencegah "flicker" tampilan role lama saat token sudah expired
// (misal buka browser lagi besoknya) — daripada nampilin UI dulu baru ketauan salah.
export function SessionGate({ children }: { children: React.ReactNode }) {
  const { token, logout, setAuth } = useAuthStore()
  const [checking, setChecking] = useState(!!token)

  useEffect(() => {
    if (!token) {
      setChecking(false)
      return
    }

    api.get("/me")
      .then((res) => {
        // refresh data user (role/branch) sekalian, jaga-jaga ada perubahan dari admin
        setAuth(token, { ...useAuthStore.getState().user, ...res.data } as any)
      })
      .catch(() => {
        logout()
      })
      .finally(() => setChecking(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    )
  }

  return <>{children}</>
}