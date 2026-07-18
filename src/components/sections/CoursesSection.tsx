import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export async function CoursesSection({ heading, intro }: { heading: string; intro: string }) {
  const courses = await db.course.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      sessions: {
        where: { status: "SCHEDULED", startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 1,
      },
    },
  });

  return (
    <section className="bg-soft py-16">
      <Container>
        <h2 className="text-center font-[family-name:var(--font-heading)] text-3xl text-navy sm:text-4xl">{heading}</h2>
        {intro && <p className="mx-auto mt-4 max-w-2xl text-center text-muted">{intro}</p>}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => {
            const next = c.sessions[0];
            return (
              <div key={c.id} className="flex flex-col overflow-hidden rounded-[20px] border bg-white shadow-sm">
                {c.imagePath && (
                  <div className="relative aspect-[4/3] w-full">
                    <Image src={c.imagePath} alt={c.title} fill sizes="300px" className="object-cover" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-[family-name:var(--font-heading)] text-lg text-primary">{c.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted">{c.shortDesc}</p>
                  <div className="mt-3 text-sm">
                    {c.priceLabel && <div className="font-semibold text-secondary">{c.priceLabel}</div>}
                    {next ? (
                      <div className="mt-1 text-xs text-muted">Nächster Termin: {formatDateTime(next.startsAt)}</div>
                    ) : (
                      <div className="mt-1 text-xs text-muted">Termine auf Anfrage</div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <ButtonLink href={`/${c.slug}`} size="sm" variant="outline">Infos</ButtonLink>
                    {c.isBookable && <ButtonLink href="/termine" size="sm">Buchen</ButtonLink>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <ButtonLink href="/termine" size="lg">Alle Termine ansehen</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
