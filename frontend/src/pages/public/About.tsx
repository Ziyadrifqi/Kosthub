import { useSiteContent } from "@/hooks/useSiteContent"
import { usePageTitle } from "@/hooks/usePageTitle"

export default function About() {
  usePageTitle("Tentang Kami")
  const { data: content } = useSiteContent()

  return (
    <section className="max-w-2xl mx-auto px-6 py-16 bg-paper">
      <span className="font-mono text-xs uppercase tracking-widest text-primary">Tentang Kami</span>
      <h1 className="font-heading font-medium text-3xl text-ink mt-2 mb-6">
        {content?.about_title || "Tentang KostHub"}
      </h1>
      <p className="text-text-secondary leading-relaxed whitespace-pre-line">
        {content?.about_content || "Konten belum tersedia."}
      </p>
    </section>
  )
}