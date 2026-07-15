import { useState } from "react"
import { Link } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Mail, CheckCircle2 } from "lucide-react"
import { api } from "@/lib/api"
import { fadeUpVariant } from "@/animations/framerVariants"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")

  const forgotPassword = useMutation({
    mutationFn: async () => {
      await api.post("/auth/forgot-password", { email })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    forgotPassword.mutate()
  }

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6 py-16 bg-section">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUpVariant}
        className="w-full max-w-md bg-card border border-border rounded-md p-8 shadow-sm"
      >
        {forgotPassword.isSuccess ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto text-primary mb-3" size={32} />
            <h1 className="font-heading font-medium text-xl text-ink mb-2">Cek Email Kamu</h1>
            <p className="text-text-secondary text-sm">
              Kalau <strong>{email}</strong> terdaftar, kami sudah kirim link reset kata sandi ke sana. Cek juga folder spam kalau belum muncul.
            </p>
            <Link to="/login" className="inline-block mt-6 text-sm text-primary hover:underline font-medium">
              Kembali ke Masuk
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Mail size={18} className="text-primary" />
              <h1 className="font-heading font-medium text-2xl text-ink">Lupa Kata Sandi</h1>
            </div>
            <p className="text-text-secondary text-sm mb-6">
              Masukkan email akunmu, kami kirim link buat reset kata sandi.
            </p>

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

              <button
                type="submit"
                disabled={forgotPassword.isPending}
                className="w-full font-heading font-medium bg-ink hover:bg-primary text-paper rounded-sm py-2.5 transition-colors disabled:opacity-60"
              >
                {forgotPassword.isPending ? "Mengirim..." : "Kirim Link Reset"}
              </button>
            </form>

            <p className="text-center text-sm text-text-secondary mt-6">
              Ingat kata sandimu?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Masuk di sini
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}