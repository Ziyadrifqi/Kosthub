import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

const IDLE_LIMIT_MS = 30 * 60 * 1000 // 30 menit
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"]

export function useIdleLogout() {
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!token) return

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        logout()
        navigate("/login", { state: { reason: "idle" } })
      }, IDLE_LIMIT_MS)
    }

    resetTimer()
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer))
    }
  }, [token, logout, navigate])
}