import { useState } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Lock, CheckCircle2, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"
import { fadeUpVariant } from "@/animations/framerVariants"

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token") ?? ""

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword

  const resetPassword = useMutation({
    mutationFn: async () => {
      await api.post("/auth/reset-password", { token, new_password: newPassword })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordMismatch) return
    resetPassword.mutate()
  }

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6 bg-section">
        <div className="text-center max-w-sm">
          <AlertCircle className="mx-auto text-error mb-3" size={32} />
          <p className="text-text-secondary text-sm">Link reset tidak valid. Coba minta link baru.</p>
          <Link to="/forgot-password" className="inline-block mt-4 text-sm text-primary hover:underline font-medium">
            Minta Link Baru
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6 py-16 bg-section">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUpVariant}
        className="w-full max-w-md bg-card border border-border rounded-md p-8 shadow-sm"
      >
        {resetPassword.isSuccess ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto text-primary mb-3" size={32} />
            <h1 className="font-heading font-medium text-xl text-ink mb-2">Kata Sandi Berhasil Diubah</h1>
            <p className="text-text-secondary text-sm mb-6">Silakan masuk dengan kata sandi barumu.</p>
            <button
              onClick={() => navigate("/login")}
              className="font-heading font-medium bg-ink hover:bg-primary text-paper rounded-sm px-6 py-2.5 transition-colors"
            >
              Ke Halaman Masuk
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Lock size={18} className="text-primary" />
              <h1 className="font-heading font-medium text-2xl text-ink">Buat Kata Sandi Baru</h1>
            </div>
            <p className="text-text-secondary text-sm mb-6">Minimal 6 karakter.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wide text-text-secondary mb-1.5">Konfirmasi Kata Sandi</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-border rounded-sm px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
                {passwordMismatch && (
                  <p className="text-clay text-xs mt-1.5">Kata sandi tidak cocok.</p>
                )}
              </div>

              {resetPassword.isError && (
                <p className="text-clay text-sm font-mono">
                  {(resetPassword.error as any)?.response?.data?.error ?? "Gagal reset kata sandi."}
                </p>
              )}

              <button
                type="submit"
                disabled={resetPassword.isPending || passwordMismatch}
                className="w-full font-heading font-medium bg-ink hover:bg-primary text-paper rounded-sm py-2.5 transition-colors disabled:opacity-60"
              >
                {resetPassword.isPending ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}