import { useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2 } from "lucide-react"
import { api } from "@/lib/api"

const editableKeys = [
  { key: "hero_title", label: "Judul Hero (Halaman Utama)" },
  { key: "hero_subtitle", label: "Subjudul Hero" },
  { key: "promo_banner", label: "Banner Promo (kosongkan untuk sembunyikan)" },
  { key: "announcement", label: "Pengumuman (kosongkan untuk sembunyikan)" },
]

export default function StaffContent() {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ["site-contents-admin"],
    queryFn: async () => {
      const res = await api.get<Record<string, string>>("/staff/site-contents")
      return res.data
    },
  })

  const [values, setValues] = useState<Record<string, string>>({})
  const [savedKey, setSavedKey] = useState<string | null>(null)

  useEffect(() => {
    if (data) setValues(data)
  }, [data])

  const updateContent = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      await api.put(`/staff/site-contents/${key}`, { value })
    },
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: ["site-contents-admin"] })
      setSavedKey(key)
      setTimeout(() => setSavedKey(null), 2000)
    },
  })

  return (
   <div className="p-4 sm:p-8">
  <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-text mb-1">Kelola Konten Website</h1>
  <p className="text-text-secondary mb-6 sm:mb-8">Perubahan langsung tampil di halaman utama. </p>

  <div className="space-y-5 max-w-2xl">
        {editableKeys.map((item) => (
          <div key={item.key} className="bg-card border border-border rounded-2xl p-5">
            <label className="block text-sm font-heading font-medium text-text mb-2">{item.label}</label>
            <textarea
              value={values[item.key] ?? ""}
              onChange={(e) => setValues({ ...values, [item.key]: e.target.value })}
              rows={2}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => updateContent.mutate({ key: item.key, value: values[item.key] ?? "" })}
                disabled={updateContent.isPending}
                className="font-heading font-medium text-sm bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 transition-colors disabled:opacity-60"
              >
                Simpan
              </button>
              {savedKey === item.key && (
                <span className="flex items-center gap-1.5 text-primary text-sm">
                  <CheckCircle2 size={15} /> Tersimpan
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}