import { useEffect } from "react"
import { ShieldCheck, MessageCircle, Sparkles, MapPin, Wallet, Star } from "lucide-react"
import { fadeUp } from "@/animations/gsapScroll"

const features = [
  { icon: ShieldCheck, title: "Kost Terverifikasi", desc: "Setiap listing dicek langsung oleh tim kami sebelum tayang.", rotate: -2 },
  { icon: Wallet, title: "Harga Transparan", desc: "Tidak ada biaya tersembunyi. Harga yang tertera adalah harga final.", rotate: 1.5 },
  { icon: MessageCircle, title: "Live Chat Admin", desc: "Tanya langsung ke admin kost soal ketersediaan atau aturan.", rotate: -1 },
  { icon: Sparkles, title: "AI Assistant", desc: "Bingung pilih kost? Tanya asisten AI kami, tersedia 24 jam.", rotate: 2 },
  { icon: MapPin, title: "Peta Interaktif", desc: "Lihat lokasi kost relatif terhadap kampus atau kantor kamu.", rotate: -2.5 },
  { icon: Star, title: "Review Asli", desc: "Ulasan hanya dari penghuni yang benar-benar pernah booking.", rotate: 1 },
]

export function FeatureGrid() {
  useEffect(() => {
    fadeUp(".feature-card", 0.08)
  }, [])

  return (
    <section className="py-24 px-6 bg-section relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">Papan Pengumuman</span>
          <h2 className="font-heading font-medium text-3xl md:text-4xl text-ink mt-3">
            Dibangun untuk Ketenangan Kamu
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {features.map((f) => (
            <div
              key={f.title}
              style={{ transform: `rotate(${f.rotate}deg)` }}
              className="feature-card relative bg-card border border-border rounded-sm p-6 shadow-md hover:shadow-lg hover:!rotate-0 transition-all duration-300"
            >
              {/* pin */}
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gold shadow-sm ring-2 ring-card" />

              <div className="w-10 h-10 rounded-sm bg-ink flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-paper" strokeWidth={1.75} />
              </div>
              <h3 className="font-heading font-medium text-lg text-ink mb-1.5">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
