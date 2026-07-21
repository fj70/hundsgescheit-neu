import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "./NewsletterForm";
import type { SiteSettings } from "@/lib/settings";

function DashLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="inline-flex items-center gap-2 text-foreground/75 transition-colors hover:text-primary">
        <span className="text-accent" aria-hidden>—</span>
        {children}
      </Link>
    </li>
  );
}

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-4 flex items-center gap-2 font-[family-name:var(--font-heading)] text-base text-navy">
      {children}
      <span className="h-px flex-1 bg-navy/10" />
    </h4>
  );
}

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="relative mt-24 bg-gradient-to-br from-[#eef2f8] via-[#e9e6f1] to-[#e4eef2]">
      {/* Akzentlinie oben */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-secondary" />

      <Container className="grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-12">
        {/* Marke */}
        <div className="lg:col-span-4">
          <Image
            src="/uploads/2025/04/hundsgescheit_Kopf_Blau-1024x724.png"
            alt={settings.siteName}
            width={120}
            height={85}
            className="h-20 w-auto"
          />
          <p className="mt-4 font-[family-name:var(--font-hand)] text-2xl text-primary">
            {settings.tagline || "mit Herz & Verstand"}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-foreground/70">
            Hundetraining für ein starkes Team aus Mensch und Hund – einfühlsam, fair und
            fachlich fundiert. In {settings.city || "Essen"} und Umgebung.
          </p>
          <div className="mt-5 space-y-1.5 text-sm">
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-foreground/75 hover:text-primary">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-secondary" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                {settings.email}
              </a>
            )}
            {settings.phone && (
              <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-foreground/75 hover:text-primary">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-secondary" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z"/></svg>
                {settings.phone}
              </a>
            )}
          </div>
        </div>

        {/* Dienstleistungen */}
        <div className="lg:col-span-3">
          <ColTitle>Dienstleistungen</ColTitle>
          <ul className="space-y-2.5 text-sm">
            <DashLink href="/einzelcoaching">Einzelcoaching</DashLink>
            <DashLink href="/gruppencoaching">Gruppencoaching</DashLink>
            <DashLink href="/onlinecoaching">Onlinecoaching</DashLink>
            <DashLink href="/socialwalk">Social Walk</DashLink>
            <DashLink href="/online-kurse">Online-Kurse</DashLink>
          </ul>
        </div>

        {/* Allgemeines */}
        <div className="lg:col-span-2">
          <ColTitle>Allgemeines</ColTitle>
          <ul className="space-y-2.5 text-sm">
            <DashLink href="/termine">Termine</DashLink>
            <DashLink href="/blog">Blog</DashLink>
            <DashLink href="/kontakt">Kontakt</DashLink>
            <DashLink href="/datenschutz">Datenschutz</DashLink>
            <DashLink href="/impressum">Impressum</DashLink>
            <DashLink href="/agb">AGB´s</DashLink>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="lg:col-span-3">
          <ColTitle>Newsletter</ColTitle>
          <p className="mb-3 text-sm text-foreground/70">
            Tipps &amp; Neuigkeiten rund ums Hundetraining – direkt in dein Postfach.
          </p>
          <NewsletterForm />
        </div>
      </Container>

      <div className="border-t border-navy/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
          <p className="text-xs text-foreground/60">©2026 – {settings.siteName}.de · Erstellt von FJ Design</p>
          <div className="flex items-center gap-3">
            {settings.instagram && (
              <a href={settings.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white transition-colors hover:bg-primary">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.17.4.36 1 .42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 1.8-.42 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.17-1 .36-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-1.8-.25-2.2-.42-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.17-.4-.36-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-1.8.42-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.17 1-.36 2.2-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4Zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3Zm6.8-11.2a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5Z"/></svg>
              </a>
            )}
            <a href="https://www.youtube.com/@Hundsgescheit" aria-label="YouTube" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white transition-colors hover:bg-primary">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 4.9 12 4.9 12 4.9s-7 0-8.9.5A3 3 0 0 0 1 7.5 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.5a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.5 31 31 0 0 0-.5-4.5ZM9.8 15.3V8.7l5.7 3.3Z"/></svg>
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}
