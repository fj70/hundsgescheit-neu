import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { parseSectionData } from "@/lib/sections";
import { CoursesSection } from "./CoursesSection";
import { ContactSection } from "./ContactSection";

type SectionRow = { id: string; type: string; data: string; isVisible: boolean };

// Helfer zum sicheren Auslesen der JSON-Daten
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

function SectionHeading({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <h2
      className={`font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-navy ${
        center ? "text-center" : ""
      }`}
    >
      {children}
    </h2>
  );
}

export function SectionRenderer({ sections }: { sections: SectionRow[] }) {
  return (
    <>
      {sections
        .filter((sec) => sec.isVisible)
        .map((sec) => (
          <SingleSection key={sec.id} section={sec} />
        ))}
    </>
  );
}

function SingleSection({ section }: { section: SectionRow }) {
  const d = parseSectionData(section.data);

  switch (section.type) {
    case "HERO": {
      const primary = firstLink(d, "primary");
      const secondary = firstLink(d, "secondary");
      const image = s(d, "image");
      return (
        <section className="relative overflow-hidden bg-soft">
          <Container className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2">
            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-4xl leading-tight text-primary sm:text-5xl lg:text-[3.4rem]">
                {s(d, "headline", "Herzlich willkommen")}
              </h1>
              {s(d, "subline") && (
                <p className="mt-5 max-w-xl text-lg text-muted">{s(d, "subline")}</p>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                {primary && <ButtonLink href={primary.href} size="lg">{primary.label}</ButtonLink>}
                {secondary && (
                  <ButtonLink href={secondary.href} size="lg" variant="outline">
                    {secondary.label}
                  </ButtonLink>
                )}
              </div>
            </div>
            {image && (
              <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-[20px] shadow-xl">
                <Image src={image} alt="" fill sizes="(max-width:1024px) 90vw, 400px" className="object-cover" priority />
              </div>
            )}
          </Container>
        </section>
      );
    }

    case "RICHTEXT":
      return (
        <section className="py-14">
          <Container className="max-w-3xl">
            {s(d, "heading") && <SectionHeading>{s(d, "heading")}</SectionHeading>}
            <div className="prose-hg mt-5" dangerouslySetInnerHTML={{ __html: s(d, "html") }} />
          </Container>
        </section>
      );

    case "IMAGE_TEXT": {
      const image = s(d, "image");
      const left = s(d, "imageSide", "right") === "left";
      return (
        <section className="py-14">
          <Container className="grid items-center gap-10 lg:grid-cols-2">
            {image && (
              <div className={`relative aspect-[4/3] w-full overflow-hidden rounded-[20px] shadow-lg ${left ? "" : "lg:order-2"}`}>
                <Image src={image} alt={s(d, "imageAlt")} fill sizes="(max-width:1024px) 90vw, 550px" className="object-cover" />
              </div>
            )}
            <div>
              {s(d, "heading") && <SectionHeading>{s(d, "heading")}</SectionHeading>}
              <div className="prose-hg mt-4" dangerouslySetInnerHTML={{ __html: s(d, "html") }} />
            </div>
          </Container>
        </section>
      );
    }

    case "CARDS": {
      const cards = arr(d, "cards");
      return (
        <section className="bg-soft py-16">
          <Container>
            {s(d, "heading") && <SectionHeading center>{s(d, "heading")}</SectionHeading>}
            {s(d, "intro") && <p className="mx-auto mt-4 max-w-2xl text-center text-muted">{s(d, "intro")}</p>}
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((c, i) => {
                const href = typeof c.href === "string" ? c.href : "";
                const img = typeof c.image === "string" ? c.image : "";
                const inner = (
                  <div className="flex h-full flex-col overflow-hidden rounded-[20px] border bg-white shadow-sm transition-shadow hover:shadow-md">
                    {img && (
                      <div className="relative aspect-[4/3] w-full">
                        <Image src={img} alt={String(c.title ?? "")} fill sizes="300px" className="object-cover" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-[family-name:var(--font-heading)] text-lg text-primary">{String(c.title ?? "")}</h3>
                      <p className="mt-2 flex-1 text-sm text-muted">{String(c.text ?? "")}</p>
                      {href && <span className="mt-4 text-sm font-semibold text-secondary">weitere Informationen →</span>}
                    </div>
                  </div>
                );
                return href ? (
                  <Link key={i} href={href}>{inner}</Link>
                ) : (
                  <div key={i}>{inner}</div>
                );
              })}
            </div>
          </Container>
        </section>
      );
    }

    case "STEPS": {
      const steps = arr(d, "steps");
      return (
        <section className="py-16">
          <Container>
            {s(d, "heading") && <SectionHeading center>{s(d, "heading")}</SectionHeading>}
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {steps.map((st, i) => (
                <div key={i} className="rounded-[20px] border bg-white p-6 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-[family-name:var(--font-heading)] text-white">
                    {i + 1}
                  </div>
                  <h3 className="font-[family-name:var(--font-heading)] text-lg text-primary">{String(st.title ?? "")}</h3>
                  <p className="mt-2 text-sm text-muted">{String(st.text ?? "")}</p>
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
        <section className="bg-primary py-14 text-white">
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
        <section className="py-14">
          <Container>
            {s(d, "heading") && <SectionHeading center>{s(d, "heading")}</SectionHeading>}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((im, i) => {
                const src = typeof im.src === "string" ? im.src : "";
                if (!src) return null;
                return (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-[20px]">
                    <Image src={src} alt={String(im.alt ?? "")} fill sizes="300px" className="object-cover" />
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
        <section className="bg-soft-2 py-16">
          <Container>
            {s(d, "heading") && <SectionHeading center>{s(d, "heading")}</SectionHeading>}
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((it, i) => (
                <figure key={i} className="rounded-[20px] bg-white p-6 shadow-sm">
                  <blockquote className="font-[family-name:var(--font-hand)] text-lg text-navy">
                    „{String(it.quote ?? "")}"
                  </blockquote>
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
        <section className="py-16">
          <Container className="max-w-3xl">
            {s(d, "heading") && <SectionHeading center>{s(d, "heading")}</SectionHeading>}
            <div className="mt-8 divide-y rounded-[20px] border bg-white">
              {items.map((it, i) => (
                <details key={i} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-foreground">
                    {String(it.q ?? "")}
                    <span className="text-primary transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-muted">{String(it.a ?? "")}</p>
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
        <section className="py-16">
          <Container>
            <div className="rounded-[20px] bg-primary px-8 py-14 text-center text-white">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl">{s(d, "heading", "Bereit loszulegen?")}</h2>
              {s(d, "text") && <p className="mx-auto mt-4 max-w-xl text-white/85">{s(d, "text")}</p>}
              {cta && (
                <ButtonLink href={cta.href} size="lg" variant="accent" className="mt-8">
                  {cta.label}
                </ButtonLink>
              )}
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
