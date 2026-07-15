import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { KeyRound } from "lucide-react"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { fadeUpVariant } from "@/animations/framerVariants"

const ADMIN_ROLES = ["staff", "owner", "super_admin"]

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const idleReason = (location.state as { reason?: string })?.reason === "idle"

  const setAuth = useAuthStore((s) => s.setAuth)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/auth/login", { email, password })
      return res.data
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user)

      const from = (location.state as { from?: Location })?.from?.pathname

      if (from) {
        // ada halaman asal yang tadinya mau diakses sebelum diarahkan ke login → balik ke situ
        navigate(from, { replace: true })
        return
      }

      // tidak ada halaman asal → tentukan tujuan default berdasarkan role
      if (data.user.role && ADMIN_ROLES.includes(data.user.role.name)) {
        navigate("/admin", { replace: true })
      } else {
        navigate("/", { replace: true })
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate()
  }

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6 py-16 bg-section">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUpVariant}
        className="w-full max-w-md bg-card border border-border rounded-md p-8 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-1">
          <KeyRound size={18} className="text-primary" />
          <h1 className="font-heading font-medium text-2xl text-ink">Masuk ke KostHub</h1>
        </div>
        <p className="text-text-secondary text-sm mb-6">Cari dan kelola kost impianmu.</p>
{idleReason && (
  <div className="bg-warning/10 border border-warning/30 text-warning text-xs rounded-sm p-3 mb-4">
    Sesi kamu berakhir karena tidak ada aktivitas selama 30 menit. Silakan masuk lagi.
  </div>
)}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">Kata Sandi</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              placeholder="••••••••"
            />
          </div>
<div className="flex justify-end -mt-2">
  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
    Lupa kata sandi?
  </Link>
</div>
          {loginMutation.isError && (
            <p className="text-clay text-sm font-mono">Email atau kata sandi salah.</p>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full font-heading font-medium bg-ink hover:bg-primary text-paper rounded-sm py-2.5 transition-colors disabled:opacity-60"
          >
            {loginMutation.isPending ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Belum punya akun?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </motion.div>
    </div>
  )
}