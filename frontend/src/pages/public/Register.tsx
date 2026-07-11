import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { KeyRound } from "lucide-react"
import { api } from "@/lib/api"
import { fadeUpVariant } from "@/animations/framerVariants"

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" })

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/auth/register", form)
      return res.data
    },
    onSuccess: () => navigate("/login"),
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    registerMutation.mutate()
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
          <h1 className="font-heading font-medium text-2xl text-ink">Buat Akun Baru</h1>
        </div>
        <p className="text-text-secondary text-sm mb-6">Gratis, cuma butuh beberapa detik.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">Nama Lengkap</label>
            <input
              name="name" required value={form.name} onChange={handleChange}
              className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              placeholder="Masukkan nama"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">Email</label>
            <input
              type="email" name="email" required value={form.email} onChange={handleChange}
              className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              placeholder="Masukkan Email"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">No. HP</label>
            <input
              name="phone" value={form.phone} onChange={handleChange}
              className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              placeholder="Masukkan No.hp"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">Kata Sandi</label>
            <input
              type="password" name="password" required minLength={6} value={form.password} onChange={handleChange}
              className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              placeholder="Minimal 6 karakter"
            />
          </div>

          {registerMutation.isError && (
            <p className="text-clay text-sm font-mono">Gagal daftar. Email mungkin sudah dipakai.</p>
          )}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full font-heading font-medium bg-ink hover:bg-primary text-paper rounded-sm py-2.5 transition-colors disabled:opacity-60"
          >
            {registerMutation.isPending ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Masuk di sini
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
