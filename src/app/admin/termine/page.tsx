import { db } from "@/lib/db";
import { formatDateTime, formatTime, toDatetimeLocal } from "@/lib/utils";
import { createSession, updateSessionStatus, deleteSession, setBookingStatus } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminTermine() {
  const now = new Date();
  const [courses, sessions] = await Promise.all([
    db.course.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    db.courseSession.findMany({
      where: { startsAt: { gte: new Date(now.getTime() - 7 * 864e5) } },
      orderBy: { startsAt: "asc" },
      include: { course: true, bookings: { orderBy: { createdAt: "asc" } } },
    }),
  ]);

  const input = "rounded-lg border bg-white px-3 py-2 text-sm";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl text-primary">Termine &amp; Buchungen</h1>
        <p className="mt-1 text-muted">Alle Kurstermine und Buchungen im Blick.</p>
      </div>

      {/* Termin anlegen */}
      <section className="rounded-[20px] border bg-white p-6">
        <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg text-navy">Neuen Termin anlegen</h2>
        <form action={createSession} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-muted">Kurs</label>
            <select name="courseId" className={`${input} w-full`} required>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Beginn</label>
            <input type="datetime-local" name="startsAt" className={`${input} w-full`} required />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Dauer (Min)</label>
            <input type="number" name="durationMin" defaultValue={90} className={`${input} w-full`} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Plätze</label>
            <input type="number" name="capacity" defaultValue={6} className={`${input} w-full`} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-muted">Ort</label>
            <input name="location" placeholder="z. B. Essen" className={`${input} w-full`} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-muted">Notiz (optional)</label>
            <input name="note" className={`${input} w-full`} />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Termin anlegen</button>
          </div>
        </form>
      </section>

      {/* Terminliste */}
      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-heading)] text-lg text-navy">Termine</h2>
        {sessions.length === 0 && <p className="text-muted">Noch keine Termine.</p>}
        {sessions.map((s) => {
          const active = s.bookings.filter((b) => b.status !== "CANCELLED");
          const booked = active.reduce((sum, b) => sum + b.people, 0);
          return (
            <div key={s.id} className={`rounded-[20px] border bg-white p-5 ${s.status === "CANCELLED" ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                <div className="flex items-center gap-3">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: s.course.color }} />
                  <div>
                    <div className="font-[family-name:var(--font-heading)] text-primary">{s.course.title}</div>
                    <div className="text-sm text-muted">{formatDateTime(s.startsAt)}–{formatTime(s.endsAt)} · {s.location || "—"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted">{booked} / {s.capacity} belegt</span>
                  {s.status === "SCHEDULED" ? (
                    <form action={updateSessionStatus}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="status" value="CANCELLED" /><button className="rounded-lg border px-3 py-1.5 text-xs">Absagen</button></form>
                  ) : (
                    <form action={updateSessionStatus}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="status" value="SCHEDULED" /><button className="rounded-lg border px-3 py-1.5 text-xs">Reaktivieren</button></form>
                  )}
                  <form action={deleteSession}><input type="hidden" name="id" value={s.id} /><button className="rounded-lg px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">Löschen</button></form>
                </div>
              </div>

              {s.bookings.length === 0 ? (
                <p className="pt-3 text-sm text-muted">Noch keine Buchungen.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {s.bookings.map((b) => (
                    <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-soft-2/50 px-3 py-2 text-sm">
                      <div>
                        <span className="font-medium">{b.customerName}</span>
                        {b.dogName && <span className="text-muted"> · Hund: {b.dogName}</span>}
                        <span className="text-muted"> · {b.people} Pers.</span>
                        <a href={`mailto:${b.customerEmail}`} className="ml-2 text-secondary hover:underline">{b.customerEmail}</a>
                        {b.customerPhone && <span className="text-muted"> · {b.customerPhone}</span>}
                        {b.notes && <div className="text-xs text-muted">{b.notes}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${b.status === "CONFIRMED" ? "bg-green-100 text-green-700" : b.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {b.status === "CONFIRMED" ? "bestätigt" : b.status === "CANCELLED" ? "storniert" : "offen"}
                        </span>
                        {b.status !== "CONFIRMED" && <form action={setBookingStatus}><input type="hidden" name="id" value={b.id} /><input type="hidden" name="status" value="CONFIRMED" /><button className="rounded border px-2 py-1 text-xs hover:bg-white">Bestätigen</button></form>}
                        {b.status !== "CANCELLED" && <form action={setBookingStatus}><input type="hidden" name="id" value={b.id} /><input type="hidden" name="status" value="CANCELLED" /><button className="rounded px-2 py-1 text-xs text-red-600">Stornieren</button></form>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
