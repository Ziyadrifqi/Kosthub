import { useEffect } from "react"
import { Link } from "react-router-dom"
import { ShieldCheck, MessageCircle, MapPin, Wallet, Star, Building2 } from "lucide-react"
import { fadeUp } from "@/animations/gsapScroll"

const features = [
  { icon: Building2, title: "Satu Manajemen", desc: "Kelima cabang dikelola satu tim yang sama, bukan pemilik yang berbeda-beda." },
  { icon: Wallet, title: "Harga Transparan", desc: "Tidak ada biaya tersembunyi. Harga yang tertera adalah harga final." },
  { icon: ShieldCheck, title: "Standar Setara", desc: "Kebersihan dan keamanan yang sama persis di Depok, Jaksel, Tangerang, dan Cikarang." },
  { icon: MessageCircle, title: "Live Chat Admin", desc: "Tanya langsung ke admin cabang soal ketersediaan atau aturan kost." },
  { icon: MapPin, title: "Peta Interaktif", desc: "Lihat lokasi tiap cabang relatif terhadap kampus atau kantor kamu." },
  { icon: Star, title: "Review Asli", desc: "Ulasan hanya dari penghuni yang benar-benar pernah tinggal di sana." },
]

export function FeatureGrid() {
  useEffect(() => {
    fadeUp(".feature-row", 0.06)
  }, [])

  return (
    <section className="py-24 px-6 bg-section">
      <div className="max-w-4xl mx-auto">
        <div className="mb-14">
          <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Kenapa satu brand</p>
          <h2 className="font-heading font-medium text-3xl md:text-4xl text-ink max-w-lg">
            Bukan marketplace acak — satu standar di setiap cabang
          </h2>
        </div>

        <div className="divide-y divide-border border-t border-b border-border">
          {features.map((f, i) =>
            f.title === "Peta Interaktif" ? (
              <Link
                key={f.title}
                to="/map"
                className="feature-row grid sm:grid-cols-[80px_180px_1fr] gap-4 sm:gap-8 py-6 items-start hover:bg-section-hover transition-colors"
              >
                <span className="font-mono text-sm text-brass">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex items-center gap-2.5">
                  <f.icon className="w-4 h-4 text-primary shrink-0" strokeWidth={1.75} />
                  <h3 className="font-heading font-medium text-ink">{f.title}</h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </Link>
            ) : (
              <div
                key={f.title}
                className="feature-row grid sm:grid-cols-[80px_180px_1fr] gap-4 sm:gap-8 py-6 items-start"
              >
                <span className="font-mono text-sm text-brass">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex items-center gap-2.5">
                  <f.icon className="w-4 h-4 text-primary shrink-0" strokeWidth={1.75} />
                  <h3 className="font-heading font-medium text-ink">{f.title}</h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}