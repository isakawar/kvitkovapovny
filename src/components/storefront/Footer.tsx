type FooterProps = {
  contactPhone?: string | null
  contactEmail?: string | null
  instagramUrl?: string | null
}

export function Footer({ contactPhone, contactEmail, instagramUrl }: FooterProps) {
  return (
    <footer className="border-t border-ink/10 bg-cream px-6 py-10 text-sm text-ink-soft sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <p>© {new Date().getFullYear()} kvitkova povnya</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {contactPhone && <a href={`tel:${contactPhone}`} className="hover:text-accent">{contactPhone}</a>}
          {contactEmail && <a href={`mailto:${contactEmail}`} className="hover:text-accent">{contactEmail}</a>}
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
              Instagram
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
