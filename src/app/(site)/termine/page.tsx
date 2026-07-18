import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";
import { formatDateTime, formatTime } from "@/lib/utils";
import { BookingForm, type SessionOption } from "@/components/booking/BookingForm";

export const metadata: Metadata = {
  title: "Termine & Buchung",
  description: "Freie Termine für Gruppencoaching, Social Walk und mehr – jetzt online buchen.",
};

export const dynamic = "force-dynamic";

export default async function TerminePage() {
  const sessions = await db.courseSession.findMany({
    where: { status: "SCHEDULED", startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    include: {
      course: true,
      bookings: { where: { status: { in: ["PENDING", "CONFIRMED"] } }, select: { people: true } },
    },
  });

  const withFree = sessions.map((s) => {
    const booked = s.bookings.reduce((sum, b) => sum + b.people, 0);
    return { ...s, free: Math.max(0, s.capacity - booked) };
  });

  const options: SessionOption[] = withFree.map((s) => ({
    id: s.id,
    label: `${s.course.title} – ${formatDateTime(s.startsAt)}`,
    free: s.free,
  }));

  return (
    <>
      <section className="bg-soft py-16">
        <Container>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl text-primary sm:text-5xl">Termine &amp; Buchung</h1>
          <p className="mt-4 max-w-2xl text-muted">
            Finde einen passenden Termin und sichere dir deinen Platz. Nach deiner Anfrage bestätigt Chiara die Buchung.
          </p>
        </Container>
      </section>

      <section className="py-14">
        <Container className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl text-navy">Freie Termine</h2>
            {withFree.length === 0 ? (
              <p className="mt-6 text-muted">Aktuell sind keine Termine online. Schreib mir gern über das Kontaktformular.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {withFree.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 rounded-[20px] border bg-white p-4 shadow-sm">
                    <div
                      className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-white"
                      style={{ backgroundColor: s.course.color }}
                    >
                      <span className="text-lg font-bold leading-none">{new Date(s.startsAt).getDate()}</span>
                      <span className="text-[10px] uppercase">
                        {new Date(s.startsAt).toLocaleDateString("de-DE", { month: "short" })}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-[family-name:var(--font-heading)] text-primary">{s.course.title}</div>
                      <div className="text-sm text-muted">
                        {formatDateTime(s.startsAt)}–{formatTime(s.endsAt)} Uhr
                        {s.location ? ` · ${s.location}` : ""}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      {s.course.priceLabel && <div className="font-semibold text-secondary">{s.course.priceLabel}</div>}
                      <div className={s.free > 0 ? "text-muted" : "text-red-600"}>
                        {s.free > 0 ? `${s.free} frei` : "ausgebucht"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[20px] border bg-soft p-6 sm:p-8">
              <h2 className="font-[family-name:var(--font-heading)] text-xl text-primary">Termin buchen</h2>
              {options.length > 0 ? (
                <div className="mt-5">
                  <BookingForm sessions={options} />
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted">Zurzeit keine buchbaren Termine.</p>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
