import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { fadeUpVariant } from "@/animations/framerVariants"

export default function Login() {
  const navigate = useNavigate()
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
      navigate("/")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate()
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUpVariant}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm"
      >
        <h1 className="font-heading font-extrabold text-2xl text-text mb-1">Masuk ke KostHub</h1>
        <p className="text-text-secondary text-sm mb-6">Cari dan kelola kost impianmu.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Kata Sandi</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              placeholder="••••••••"
            />
          </div>

          {loginMutation.isError && (
            <p className="text-error text-sm">Email atau kata sandi salah.</p>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full font-heading font-medium bg-primary hover:bg-primary-hover text-white rounded-lg py-2.5 transition-colors disabled:opacity-60"
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