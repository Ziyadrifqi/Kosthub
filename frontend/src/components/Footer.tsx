import { Link } from "react-router-dom"

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
    <footer className="border-t border-border bg-section">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="font-heading font-extrabold text-xl text-text">
            Kost<span className="text-primary">Hub</span>
          </Link>
          <p className="text-sm text-text-secondary mt-3">
            Platform booking kost terpercaya untuk kamu yang cari tempat tinggal nyaman.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-heading font-semibold text-sm text-text mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-text-secondary hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center text-sm text-text-secondary">
          © {new Date().getFullYear()} KostHub. Semua hak dilindungi.
        </div>
      </div>
    </footer>
  )
}