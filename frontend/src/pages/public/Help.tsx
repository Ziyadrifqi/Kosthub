import { useSiteContent } from "@/hooks/useSiteContent"

export default function Help() {
  const { data: content } = useSiteContent()

  return (
    <section className="max-w-2xl mx-auto px-6 py-16 bg-paper">
      <span className="font-mono text-xs uppercase tracking-widest text-primary">Bantuan</span>
      <h1 className="font-heading font-medium text-3xl text-ink mt-2 mb-6">
        {content?.help_title || "Pusat Bantuan"}
      </h1>
      <p className="text-text-secondary leading-relaxed whitespace-pre-line">
        {content?.help_content || "Konten belum tersedia."}
      </p>
    </section>
  )
}