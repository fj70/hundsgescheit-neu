import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import type { SiteSettings } from "@/lib/settings";

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = 2026;
  return (
    <footer className="mt-20 bg-primary text-white/90">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image
            src="/uploads/2025/04/hundsgescheit_Kopf_Blau-1024x724.png"
            alt={settings.siteName}
            width={140}
            height={99}
            className="h-20 w-auto brightness-0 invert opacity-90"
          />
          <p className="mt-4 font-[family-name:var(--font-hand)] text-lg text-accent">
            {settings.tagline}
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-[family-name:var(--font-heading)] text-sm uppercase tracking-wide text-white">
            Dienstleistungen
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/einzelcoaching" className="hover:text-accent">Einzelcoaching</Link></li>
            <li><Link href="/gruppencoaching" className="hover:text-accent">Gruppencoaching</Link></li>
            <li><Link href="/onlinecoaching" className="hover:text-accent">Onlinecoaching</Link></li>
            <li><Link href="/socialwalk" className="hover:text-accent">Social Walk</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-[family-name:var(--font-heading)] text-sm uppercase tracking-wide text-white">
            Allgemeines
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/termine" className="hover:text-accent">Termine & Buchung</Link></li>
            <li><Link href="/blog" className="hover:text-accent">Blog</Link></li>
            <li><Link href="/kontakt" className="hover:text-accent">Kontakt</Link></li>
            <li><Link href="/datenschutz" className="hover:text-accent">Datenschutz</Link></li>
            <li><Link href="/impressum" className="hover:text-accent">Impressum</Link></li>
            <li><Link href="/agb" className="hover:text-accent">AGB</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-[family-name:var(--font-heading)] text-sm uppercase tracking-wide text-white">
            Kontakt
          </h4>
          <ul className="space-y-2 text-sm">
            {settings.email && (
              <li><a href={`mailto:${settings.email}`} className="hover:text-accent">{settings.email}</a></li>
            )}
            {settings.phone && (
              <li><a href={`tel:${settings.phone}`} className="hover:text-accent">{settings.phone}</a></li>
            )}
            {settings.city && <li>{settings.city} und Umgebung</li>}
          </ul>
          <div className="mt-4 flex gap-3">
            {settings.instagram && (
              <a href={settings.instagram} aria-label="Instagram" className="hover:text-accent" target="_blank" rel="noopener noreferrer">Instagram</a>
            )}
            {settings.facebook && (
              <a href={settings.facebook} aria-label="Facebook" className="hover:text-accent" target="_blank" rel="noopener noreferrer">Facebook</a>
            )}
          </div>
        </div>
      </Container>

      <div className="border-t border-white/15 py-5 text-center text-xs text-white/70">
        © {year} – {settings.siteName}.de · Erstellt von FJ Design
      </div>
    </footer>
  );
}
