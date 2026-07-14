import { Mail, Phone, MapPin } from "lucide-react"
import { useSiteContent } from "@/hooks/useSiteContent"

export default function Contact() {
  const { data: content } = useSiteContent()

  return (
    <section className="max-w-2xl mx-auto px-6 py-16 bg-paper">
      <span className="font-mono text-xs uppercase tracking-widest text-primary">Kontak</span>
      <h1 className="font-heading font-medium text-3xl text-ink mt-2 mb-4">
        {content?.contact_title || "Hubungi Kami"}
      </h1>
      <p className="text-text-secondary leading-relaxed whitespace-pre-line mb-8">
        {content?.contact_content || "Konten belum tersedia."}
      </p>

      <div className="space-y-4 bg-card border border-border rounded-md p-6">
        {content?.contact_email && (
          <a href={`mailto:${content.contact_email}`} className="flex items-center gap-3 text-sm text-ink hover:text-primary transition-colors">
            <Mail size={16} className="text-primary" /> {content.contact_email}
          </a>
        )}
        {content?.contact_phone && (
          <a href={`tel:${content.contact_phone}`} className="flex items-center gap-3 text-sm text-ink hover:text-primary transition-colors">
            <Phone size={16} className="text-primary" /> {content.contact_phone}
          </a>
        )}
        {content?.contact_address && (
          <p className="flex items-center gap-3 text-sm text-ink">
            <MapPin size={16} className="text-primary" /> {content.contact_address}
          </p>
        )}
      </div>
    </section>
  )
}