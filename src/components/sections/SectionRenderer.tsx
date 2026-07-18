import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { parseSectionData } from "@/lib/sections";
import { CoursesSection } from "./CoursesSection";
import { ContactSection } from "./ContactSection";

type SectionRow = { id: string; type: string; data: string; isVisible: boolean };

function s(d: Record<string, unknown>, k: string, fb = ""): string {
  const v = d[k];
  return typeof v === "string" ? v : fb;
}
function arr(d: Record<string, unknown>, k: string): Record<string, unknown>[] {
  const v = d[k];
  return Array.isArray(v) ? (v as Record<string, unknown>[]) : [];
}
function firstLink(d: Record<string, unknown>, k: string): { label: string; href: string } | null {
  const a = arr(d, k);
  if (!a[0]) return null;
  const label = typeof a[0].label === "string" ? a[0].label : "";
  const href = typeof a[0].href === "string" ? a[0].href : "";
  return label && href ? { label, href } : null;
}

// Überschrift mit kleinem Akzent-Strich darunter
function SectionHeading({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <h2 className="font-[family-name:var(--font-heading)] text-3xl text-navy sm:text-4xl">{children}</h2>
      <span className={`mt-3 block h-1 w-16 rounded-full bg-accent ${center ? "mx-auto" : ""}`} />
    </div>
  );
}

export function SectionRenderer({ sections }: { sections: SectionRow[] }) {
  const visible = sections.filter((sec) => sec.isVisible);
  // Laufender Zähler für „schlichte" Sektionen (RICHTEXT/IMAGE_TEXT) → abwechselnde Hintergründe
  let plain = 0;
  return (
    <>
      {visible.map((sec) => {
        const isPlain = sec.type === "RICHTEXT" || sec.type === "IMAGE_TEXT";
        const band = isPlain ? plain++ % 2 === 1 : false;
        return <SingleSection key={sec.id} section={sec} altBg={band} />;
      })}
    </>
  );
}

function SingleSection({ section, altBg }: { section: SectionRow; altBg: boolean }) {
  const d = parseSectionData(section.data);
  const bandClass = altBg ? "bg-soft" : "bg-background";

  switch (section.type) {
    case "HERO": {
      const primary = firstLink(d, "primary");
      const secondary = firstLink(d, "secondary");
      const image = s(d, "image");
      return (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-soft via-background to-soft-2" />
          <Container className="grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2">
            <div className="hg-reveal">
              <p className="font-[family-name:var(--font-hand)] text-xl text-secondary">
                Hundeschule in Essen &amp; Umgebung
              </p>
              <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl leading-tight text-primary sm:text-5xl lg:text-[3.5rem]">
                {s(d, "headline", "Herzlich willkommen")}
              </h1>
              {s(d, "subline") && (
                <p className="mt-5 max-w-xl text-lg text-muted">{s(d, "subline")}</p>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                {primary && <ButtonLink href={primary.href} size="lg">{primary.label}</ButtonLink>}
                {secondary && (
                  <ButtonLink href={secondary.href} size="lg" variant="outline">{secondary.label}</ButtonLink>
                )}
              </div>
            </div>
            {image && (
              <div className="hg-reveal relative mx-auto w-full max-w-md">
                <div className="absolute -inset-4 -z-10 rounded-[32px] bg-accent/20 blur-2xl" />
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[28px] shadow-2xl ring-1 ring-black/5">
                  <Image src={image} alt="" fill sizes="(max-width:1024px) 90vw, 440px" className="object-cover" priority />
                </div>
              </div>
            )}
          </Container>
        </section>
      );
    }

    case "RICHTEXT":
      return (
        <section className={`${bandClass} py-16`}>
          <Container className="max-w-3xl">
            {s(d, "heading") && <div className="mb-6"><SectionHeading>{s(d, "heading")}</SectionHeading></div>}
            <div className="prose-hg" dangerouslySetInnerHTML={{ __html: s(d, "html") }} />
          </Container>
        </section>
      );

    case "IMAGE_TEXT": {
      const image = s(d, "image");
      const left = s(d, "imageSide", "right") === "left";
      return (
        <section className={`${bandClass} py-16`}>
          <Container className="grid items-center gap-10 lg:grid-cols-2">
            {image && (
              <div className={`relative aspect-[4/3] w-full overflow-hidden rounded-[24px] shadow-xl ring-1 ring-black/5 ${left ? "" : "lg:order-2"}`}>
                <Image src={image} alt={s(d, "imageAlt")} fill sizes="(max-width:1024px) 90vw, 560px" className="object-cover" />
              </div>
            )}
            <div>
              {s(d, "heading") && <div className="mb-5"><SectionHeading>{s(d, "heading")}</SectionHeading></div>}
              <div className="prose-hg" dangerouslySetInnerHTML={{ __html: s(d, "html") }} />
            </div>
          </Container>
        </section>
      );
    }

    case "CARDS": {
      const cards = arr(d, "cards");
      return (
        <section className="bg-soft-2/60 py-20">
          <Container>
            {s(d, "heading") && <SectionHeading center>{s(d, "heading")}</SectionHeading>}
            {s(d, "intro") && <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-muted">{s(d, "intro")}</p>}
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((c, i) => {
                const href = typeof c.href === "string" ? c.href : "";
                const img = typeof c.image === "string" ? c.image : "";
                const inner = (
                  <div className="group flex h-full flex-col overflow-hidden rounded-[24px] border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    {img ? (
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image src={img} alt={String(c.title ?? "")} fill sizes="320px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    ) : (
                      <div className="h-2 w-full bg-gradient-to-r from-primary to-accent" />
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-[family-name:var(--font-heading)] text-lg text-primary">{String(c.title ?? "")}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{String(c.text ?? "")}</p>
                      {href && <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-secondary group-hover:gap-2 transition-all">weitere Informationen <span aria-hidden>→</span></span>}
                    </div>
                  </div>
                );
                return href ? <Link key={i} href={href}>{inner}</Link> : <div key={i}>{inner}</div>;
              })}
            </div>
          </Container>
        </section>
      );
    }

    case "STEPS": {
      const steps = arr(d, "steps");
      return (
        <section className="py-20">
          <Container>
            {s(d, "heading") && <SectionHeading center>{s(d, "heading")}</SectionHeading>}
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {steps.map((st, i) => (
                <div key={i} className="relative rounded-[24px] border bg-white p-7 shadow-sm">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary font-[family-name:var(--font-heading)] text-white">{i + 1}</div>
                  <h3 className="font-[family-name:var(--font-heading)] text-lg text-primary">{String(st.title ?? "")}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{String(st.text ?? "")}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      );
    }

    case "STATS": {
      const items = arr(d, "items");
      return (
        <section className="bg-primary py-16 text-white">
          <Container className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            {items.map((it, i) => (
              <div key={i}>
                <div className="font-[family-name:var(--font-heading)] text-4xl text-accent">{String(it.value ?? "")}</div>
                <div className="mt-1 text-sm text-white/80">{String(it.label ?? "")}</div>
              </div>
            ))}
          </Container>
        </section>
      );
    }

    case "GALLERY": {
      const images = arr(d, "images");
      return (
        <section className="py-20">
          <Container>
            {s(d, "heading") && <SectionHeading center>{s(d, "heading")}</SectionHeading>}
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((im, i) => {
                const src = typeof im.src === "string" ? im.src : "";
                if (!src) return null;
                return (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-[20px] shadow-sm ring-1 ring-black/5">
                    <Image src={src} alt={String(im.alt ?? "")} fill sizes="300px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      );
    }

    case "TESTIMONIALS": {
      const items = arr(d, "items");
      return (
        <section className="bg-soft py-20">
          <Container>
            {s(d, "heading") && <SectionHeading center>{s(d, "heading")}</SectionHeading>}
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((it, i) => (
                <figure key={i} className="rounded-[24px] bg-white p-7 shadow-sm ring-1 ring-black/5">
                  <div className="font-[family-name:var(--font-heading)] text-3xl leading-none text-accent">&ldquo;</div>
                  <blockquote className="mt-2 font-[family-name:var(--font-hand)] text-lg text-navy">{String(it.quote ?? "")}</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-muted">— {String(it.author ?? "")}</figcaption>
                </figure>
              ))}
            </div>
          </Container>
        </section>
      );
    }

    case "FAQ": {
      const items = arr(d, "items");
      return (
        <section className="py-20">
          <Container className="max-w-3xl">
            {s(d, "heading") && <SectionHeading center>{s(d, "heading")}</SectionHeading>}
            <div className="mt-10 space-y-3">
              {items.map((it, i) => (
                <details key={i} className="group rounded-[18px] border bg-white p-5 shadow-sm transition-shadow open:shadow-md">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-navy">
                    {String(it.q ?? "")}
                    <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-soft-2 text-primary transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-muted">{String(it.a ?? "")}</p>
                </details>
              ))}
            </div>
          </Container>
        </section>
      );
    }

    case "CTA": {
      const cta = firstLink(d, "cta");
      return (
        <section className="py-20">
          <Container>
            <div className="relative overflow-hidden rounded-[32px] bg-primary px-8 py-16 text-center text-white">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-2xl" />
              <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-secondary/30 blur-2xl" />
              <div className="relative">
                <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl">{s(d, "heading", "Bereit loszulegen?")}</h2>
                {s(d, "text") && <p className="mx-auto mt-4 max-w-xl text-white/85">{s(d, "text")}</p>}
                {cta && <ButtonLink href={cta.href} size="lg" variant="accent" className="mt-8">{cta.label}</ButtonLink>}
              </div>
            </div>
          </Container>
        </section>
      );
    }

    case "COURSES":
      return <CoursesSection heading={s(d, "heading", "Kurse & Termine")} intro={s(d, "intro")} />;

    case "CONTACT":
      return <ContactSection heading={s(d, "heading", "Kontakt")} text={s(d, "text")} />;

    default:
      return null;
  }
}
