import { Link } from "react-router-dom"
import { KeyRound } from "lucide-react"

const columns = [
  {
    title: "Produk",
    links: [
      { label: "Cari Kost", to: "/rooms" },
      { label: "Cara Kerja", to: "/#cara-kerja" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kami", to: "/about" },
      { label: "Blog", to: "/blog" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "Pusat Bantuan", to: "/help" },
      { label: "Hubungi Kami", to: "/contact" },
    ],
  },
  {
    title: "Akun",
    links: [
      { label: "Masuk", to: "/login" },
      { label: "Daftar", to: "/register" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-ink text-paper">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 font-heading font-medium text-xl">
            <KeyRound size={18} className="text-gold" strokeWidth={1.75} />
            Kost<span className="text-gold">Hub</span>
          </Link>
          <p className="text-sm text-paper/60 mt-3 leading-relaxed">
            Platform booking kost terpercaya untuk kamu yang cari tempat tinggal nyaman.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-mono text-xs uppercase tracking-wide text-paper/50 mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-paper/80 hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-paper/10">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center text-sm text-paper/40 font-mono">
          © {new Date().getFullYear()} KostHub. Semua hak dilindungi.
        </div>
      </div>
    </footer>
  )
}
