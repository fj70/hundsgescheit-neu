"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export type NavItem = { label: string; href: string; children?: { label: string; href: string }[] };

export function Header({ nav, siteName }: { nav: NavItem[]; siteName: string }) {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <Container className="flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center shrink-0" aria-label={siteName}>
          <Image
            src="/uploads/2025/01/logo-768x274.png"
            alt={siteName}
            width={190}
            height={68}
            priority
            className="h-10 w-auto sm:h-12"
          />
        </Link>

        {/* Desktop-Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((item) =>
            item.children?.length ? (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className="px-3 py-2 text-[15px] font-medium text-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
                <div className="absolute left-0 top-full hidden group-hover:block pt-1">
                  <div className="min-w-56 rounded-xl border bg-white p-2 shadow-lg">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-soft-2 hover:text-primary"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-[15px] font-medium text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden lg:block">
          <ButtonLink href="/kontakt" size="sm">
            Kontakt
          </ButtonLink>
        </div>

        {/* Mobile-Toggle */}
        <button
          className="lg:hidden p-2 text-primary"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menü"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </Container>

      {/* Mobile-Menü */}
      {open && (
        <div className="lg:hidden border-t bg-white">
          <Container className="py-3">
            {nav.map((item) => (
              <div key={item.href} className="border-b last:border-0">
                {item.children?.length ? (
                  <>
                    <button
                      className="flex w-full items-center justify-between py-3 font-medium"
                      onClick={() => setServicesOpen((v) => !v)}
                    >
                      {item.label}
                      <span>{servicesOpen ? "−" : "+"}</span>
                    </button>
                    {servicesOpen && (
                      <div className="pb-2 pl-4">
                        <Link href={item.href} className="block py-2 text-sm" onClick={() => setOpen(false)}>
                          Übersicht
                        </Link>
                        {item.children.map((c) => (
                          <Link
                            key={c.href}
                            href={c.href}
                            className="block py-2 text-sm"
                            onClick={() => setOpen(false)}
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={item.href} className="block py-3 font-medium" onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <ButtonLink href="/kontakt" className="mt-4 w-full" onClick={() => setOpen(false)}>
              Kontakt
            </ButtonLink>
          </Container>
        </div>
      )}
    </header>
  );
}
