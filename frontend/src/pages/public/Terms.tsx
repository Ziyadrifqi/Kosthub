import { useSiteContent } from "@/hooks/useSiteContent"

export default function Terms() {
  const { data: content } = useSiteContent()

  return (
    <section className="max-w-2xl mx-auto px-6 py-16 bg-paper">
      <span className="font-mono text-xs uppercase tracking-widest text-primary">Kebijakan</span>
      <h1 className="font-heading font-medium text-3xl text-ink mt-2 mb-6">
        {content?.terms_title || "Syarat & Ketentuan"}
      </h1>
      <div className="text-text-secondary leading-relaxed whitespace-pre-line">
        {content?.terms_content || "Konten belum tersedia."}
      </div>
    </section>
  )
}