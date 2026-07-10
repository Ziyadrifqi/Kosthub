import { useEffect } from "react"
import { ShieldCheck, MessageCircle, Sparkles, MapPin, Wallet, Star } from "lucide-react"
import { fadeUp } from "@/animations/gsapScroll"

const features = [
  { icon: ShieldCheck, title: "Kost Terverifikasi", desc: "Setiap listing dicek langsung oleh tim kami sebelum tayang." },
  { icon: Wallet, title: "Harga Transparan", desc: "Tidak ada biaya tersembunyi. Harga yang tertera adalah harga final." },
  { icon: MessageCircle, title: "Live Chat Admin", desc: "Tanya langsung ke admin kost soal ketersediaan atau aturan." },
  { icon: Sparkles, title: "AI Assistant", desc: "Bingung pilih kost? Tanya asisten AI kami, tersedia 24 jam." },
  { icon: MapPin, title: "Peta Interaktif", desc: "Lihat lokasi kost relatif terhadap kampus atau kantor kamu." },
  { icon: Star, title: "Review Asli", desc: "Ulasan hanya dari penghuni yang benar-benar pernah booking." },
]

export function FeatureGrid() {
  useEffect(() => {
    fadeUp(".feature-card", 0.08)
  }, [])

  return (
    <section className="py-24 px-6 bg-section">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="font-heading font-semibold text-sm text-secondary">Kenapa KostHub</span>
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-text mt-2">
            Dibangun untuk Ketenangan Kamu
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary" strokeWidth={1.75} />
              </div>
              <h3 className="font-heading font-semibold text-text mb-1.5">{f.title}</h3>
              <p className="text-sm text-text-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}