import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";
import { requireCustomer, logoutCustomer } from "@/lib/customer-auth";
import { formatDateTime, formatTime } from "@/lib/utils";
import { bookAsCustomer, waitlistAsCustomer, cancelBooking } from "@/app/customer-actions";
import { AvailabilityCalendar, type CalItem } from "@/components/booking/AvailabilityCalendar";
import { redirect } from "next/navigation";

export const metadata = { title: "Mein Bereich", robots: { index: false } };
export const dynamic = "force-dynamic";

async function doLogout() {
  "use server";
  await logoutCustomer();
  redirect("/");
}

export default async function MeinBereich() {
  const session = await requireCustomer();
  const now = new Date();

  const customer = await db.customer.findUnique({
    where: { id: session.id },
    include: {
      bookings: {
        include: { session: { include: { course: true } } },
        orderBy: { createdAt: "desc" },
      },
      courseAccess: true,
    },
  });
  if (!customer) redirect("/anmelden");

  // Zugangssteuerung: manuell gesperrte + absolvierte Kurse
  const lockedCourseIds = new Set(
    customer.courseAccess.filter((a) => a.status === "LOCKED").map((a) => a.courseId),
  );
  const completedCourseIds = new Set(
    customer.courseAccess.filter((a) => a.status === "COMPLETED").map((a) => a.courseId),
  );
  // Kurs buchbar, wenn keine Voraussetzung ODER Voraussetzung absolviert
  const prereqMet = (requiresCourseId: string | null) =>
    !requiresCourseId || completedCourseIds.has(requiresCourseId);

  const sessions = await db.courseSession.findMany({
    where: { status: "SCHEDULED", startsAt: { gte: now } },
    orderBy: { startsAt: "asc" },
    include: {
      course: true,
      bookings: { where: { status: { in: ["PENDING", "CONFIRMED"] } }, select: { people: true } },
    },
  });
  const bookable = sessions
    .filter(
      (s) =>
        s.course.isActive &&
        s.course.isBookable &&
        !lockedCourseIds.has(s.courseId) &&
        prereqMet(s.course.requiresCourseId),
    )
    .map((s) => ({ ...s, free: Math.max(0, s.capacity - s.bookings.reduce((a, b) => a + b.people, 0)) }));

  const upcoming = customer.bookings.filter(
    (b) => b.status !== "CANCELLED" && b.session.startsAt >= now,
  );
  // Termine, für die der Kunde bereits eine aktive Buchung/Warteliste hat
  const myBySession = new Map<string, string>();
  for (const b of upcoming) myBySession.set(b.sessionId, b.status);

  return (
    <section className="py-12">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl text-primary">
              Hallo {customer.firstName || "und willkommen"}!
            </h1>
            <p className="mt-1 text-muted">Dein Stammkunden-Bereich – hier buchst du deine Kurse.</p>
          </div>
          <form action={doLogout}><button className="text-sm text-muted hover:text-primary">Abmelden</button></form>
        </div>

        {/* Profil + Impfstatus */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[20px] border bg-white p-6">
            <h2 className="font-[family-name:var(--font-heading)] text-lg text-navy">Dein Profil</h2>
            <dl className="mt-3 space-y-1 text-sm text-muted">
              <div>{customer.firstName} {customer.lastName}</div>
              {customer.street && <div>{customer.street}</div>}
              {(customer.zip || customer.city) && <div>{customer.zip} {customer.city}</div>}
              {customer.phone && <div>{customer.phone}</div>}
              <div className="pt-2 text-foreground">Hund: {customer.dogName || "—"}{customer.dogBreed ? `, ${customer.dogBreed}` : ""}{customer.dogAge ? `, ${customer.dogAge}` : ""}</div>
            </dl>
            <div className="mt-4">
              {customer.vaccinationApproved ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">Impfstatus bestätigt ✓</span>
              ) : (
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">Impfausweis in Prüfung</span>
              )}
            </div>
          </div>

          {/* Meine Buchungen */}
          <div className="rounded-[20px] border bg-white p-6 lg:col-span-2">
            <h2 className="font-[family-name:var(--font-heading)] text-lg text-navy">Meine Buchungen</h2>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Noch keine kommenden Buchungen. Wähle unten einen Termin.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {upcoming.map((b) => {
                  const label = b.status === "CONFIRMED" ? "bestätigt" : b.status === "WAITLIST" ? "Warteliste" : "angefragt";
                  const pill = b.status === "CONFIRMED" ? "bg-green-100 text-green-700" : b.status === "WAITLIST" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700";
                  return (
                    <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-soft-2/50 px-3 py-2 text-sm">
                      <span className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: b.session.course.color }} aria-hidden /> {b.session.course.title} – {formatDateTime(b.session.startsAt)}</span>
                      <span className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${pill}`}>{label}</span>
                        <form action={cancelBooking}>
                          <input type="hidden" name="bookingId" value={b.id} />
                          <button className="rounded-full border border-red-200 px-2.5 py-0.5 text-xs text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400" aria-label={`Buchung ${b.session.course.title} am ${formatDateTime(b.session.startsAt)} stornieren`}>Stornieren</button>
                        </form>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Verfügbarkeits-Kalender + buchbare Termine */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="mb-4 font-[family-name:var(--font-heading)] text-xl text-navy">Verfügbare Tage</h2>
            <AvailabilityCalendar
              items={bookable.map((s): CalItem => ({
                date: `${s.startsAt.getFullYear()}-${String(s.startsAt.getMonth() + 1).padStart(2, "0")}-${String(s.startsAt.getDate()).padStart(2, "0")}`,
                color: s.course.color,
                title: s.course.title,
              }))}
            />
          </div>
          <div>
          <h2 className="mb-1 font-[family-name:var(--font-heading)] text-xl text-navy">Termine buchen</h2>
          {bookable.length === 0 ? (
            <p className="mt-3 text-muted">Aktuell sind keine Termine für dich freigegeben.</p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bookable.map((s) => (
                <div key={s.id} className="rounded-[20px] border bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: s.course.color }} />
                    <span className="font-[family-name:var(--font-heading)] text-primary">{s.course.title}</span>
                  </div>
                  <div className="mt-1 text-sm text-muted">{formatDateTime(s.startsAt)}–{formatTime(s.endsAt)}{s.location ? ` · ${s.location}` : ""}</div>
                  <div className={`mt-1 text-xs ${s.free > 0 ? "text-muted" : "text-red-600"}`}>{s.free > 0 ? `${s.free} Plätze frei` : "ausgebucht"}</div>
                  {myBySession.has(s.id) ? (
                    <p className="mt-3 text-xs font-semibold text-primary">
                      {myBySession.get(s.id) === "WAITLIST" ? "Du stehst auf der Warteliste ✓" : myBySession.get(s.id) === "CONFIRMED" ? "Platz bestätigt ✓" : "Bereits angefragt ✓"}
                    </p>
                  ) : s.free > 0 ? (
                    <form action={bookAsCustomer} className="mt-3 flex items-center gap-2">
                      <input type="hidden" name="sessionId" value={s.id} />
                      <label className="sr-only" htmlFor={`people-${s.id}`}>Anzahl Personen</label>
                      <input id={`people-${s.id}`} name="people" type="number" min={1} max={s.free} defaultValue={1} className="w-16 rounded-lg border px-2 py-1.5 text-sm" />
                      <button className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Buchen</button>
                    </form>
                  ) : (
                    <form action={waitlistAsCustomer} className="mt-3">
                      <input type="hidden" name="sessionId" value={s.id} />
                      <button className="rounded-full border-2 border-primary px-4 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Auf die Warteliste</button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs text-muted">Die Bezahlung erfolgt wie gewohnt über Chiara (lexware). Nach der Buchung erhältst du eine Bestätigung.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
