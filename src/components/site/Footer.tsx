import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "./NewsletterForm";
import type { SiteSettings } from "@/lib/settings";

function DashLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="inline-flex items-center gap-2 text-foreground/80 hover:text-primary">
        <span className="text-secondary" aria-hidden>—</span>
        {children}
      </Link>
    </li>
  );
}

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-24 bg-gradient-to-br from-[#eef1f8] via-[#eae7f2] to-[#e7eef2]">
      <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {/* Logo (blauer Hundekopf, Naturfarbe) */}
        <div>
          <Image
            src="/uploads/2025/04/hundsgescheit_Kopf_Blau-1024x724.png"
            alt={settings.siteName}
            width={120}
            height={85}
            className="h-20 w-auto"
          />
        </div>

        <div>
          <h4 className="font-[family-name:var(--font-heading)] text-base text-navy">Dienstleistungen</h4>
          <span className="mt-2 mb-4 block h-0.5 w-10 bg-secondary/50" />
          <ul className="space-y-2.5 text-sm">
            <DashLink href="/einzelcoaching">Einzelcoaching</DashLink>
            <DashLink href="/gruppencoaching">Gruppencoaching</DashLink>
            <DashLink href="/onlinecoaching">Onlinecoaching</DashLink>
            <DashLink href="/socialwalk">Social Walk</DashLink>
          </ul>
        </div>

        <div>
          <h4 className="font-[family-name:var(--font-heading)] text-base text-navy">Allgemeines</h4>
          <span className="mt-2 mb-4 block h-0.5 w-10 bg-secondary/50" />
          <ul className="space-y-2.5 text-sm">
            <DashLink href="/online-kurse">Online-Kurse</DashLink>
            <DashLink href="/kontakt">Kontakt</DashLink>
            <DashLink href="/datenschutz">Datenschutz</DashLink>
            <DashLink href="/impressum">Impressum</DashLink>
            <DashLink href="/agb">AGB´s</DashLink>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-[family-name:var(--font-heading)] text-base text-navy">Newsletter</h4>
          <NewsletterForm />
        </div>
      </Container>

      <div className="border-t border-navy/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
          <p className="text-xs text-muted">©2026 – {settings.siteName}.de</p>
          <div className="flex gap-3">
            {settings.instagram && (
              <a href={settings.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white hover:bg-primary">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.17.4.36 1 .42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 1.8-.42 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.17-1 .36-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-1.8-.25-2.2-.42-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.17-.4-.36-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-1.8.42-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.17 1-.36 2.2-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4Zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3Zm6.8-11.2a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5Z" /></svg>
              </a>
            )}
            <a href="https://www.youtube.com/@Hundsgescheit" aria-label="YouTube" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white hover:bg-primary">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 4.9 12 4.9 12 4.9s-7 0-8.9.5A3 3 0 0 0 1 7.5 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.5a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.5 31 31 0 0 0-.5-4.5ZM9.8 15.3V8.7l5.7 3.3Z" /></svg>
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}
