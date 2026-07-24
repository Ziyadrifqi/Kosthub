import { Link } from "react-router-dom"
import { useBranches } from "@/hooks/useBranches"

const columns = [
  {
    title: "Produk",
    links: [
      { label: "Cari Kamar", to: "/rooms" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kami", to: "/about" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "Pusat Bantuan", to: "/help" },
      { label: "Syarat & Ketentuan", to: "/terms" },
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
  const { data: branches } = useBranches()

  return (
    <footer className="border-t border-border bg-ink text-paper">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-6 gap-8">
        <div className="col-span-2 md:col-span-2">
          <Link to="/" className="font-heading font-medium text-xl">
            KostHub
          </Link>
          <p className="text-sm text-paper/60 mt-3 leading-relaxed max-w-xs">
            Satu manajemen, empat cabang. Standar kebersihan dan keamanan yang
            sama di setiap lokasi.
          </p>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-wide text-paper/50 mb-3">Cabang</h4>
          <ul className="space-y-2">
            {branches?.map((b) => (
              <li key={b.id}>
                <Link to={`/rooms?branch=${b.id}`} className="text-sm text-paper/80 hover:text-brass transition-colors">
                  {b.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-mono text-xs uppercase tracking-wide text-paper/50 mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-paper/80 hover:text-brass transition-colors">
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