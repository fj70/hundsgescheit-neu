import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import {
  setCustomerStatus, approveVaccination, saveCustomerNotes, regenerateInvite, setCourseAccess,
} from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function KundeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [customer, courses] = await Promise.all([
    db.customer.findUnique({
      where: { id },
      include: {
        bookings: { include: { session: { include: { course: true } } }, orderBy: { createdAt: "desc" } },
        courseAccess: true,
      },
    }),
    db.course.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
  ]);
  if (!customer) notFound();

  const base = process.env.SITE_URL || "";
  const inviteUrl = customer.inviteToken ? `${base}/registrieren?token=${customer.inviteToken}` : null;
  const accessOf = (courseId: string) => customer.courseAccess.find((a) => a.courseId === courseId)?.status ?? "UNLOCKED";

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/kunden" className="text-sm text-secondary hover:underline">← Alle Kunden</Link>
        <h1 className="mt-1 font-[family-name:var(--font-heading)] text-2xl text-primary">
          {`${customer.firstName} ${customer.lastName}`.trim() || customer.email}
        </h1>
        <p className="text-sm text-muted">{customer.email} · Status: {customer.status === "ACTIVE" ? "aktiv" : customer.status === "BLOCKED" ? "gesperrt" : "eingeladen"}</p>
      </div>

      {/* Einladungslink */}
      {customer.status !== "ACTIVE" && (
        <section className="rounded-[20px] border bg-soft p-6">
          <h2 className="mb-2 font-[family-name:var(--font-heading)] text-lg text-navy">Einladung</h2>
          {inviteUrl ? (
            <>
              <p className="text-sm text-muted">Diesen Link an den Kunden schicken – damit setzt er sein Passwort und ergänzt seine Daten:</p>
              <code className="mt-2 block break-all rounded-lg bg-white px-3 py-2 text-xs">{inviteUrl}</code>
            </>
          ) : (
            <p className="text-sm text-muted">Kein aktiver Einladungslink.</p>
          )}
          <form action={regenerateInvite} className="mt-3"><input type="hidden" name="id" value={customer.id} /><button className="rounded-lg border px-3 py-1.5 text-xs">Neuen Einladungslink erzeugen</button></form>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profil */}
        <section className="rounded-[20px] border bg-white p-6">
          <h2 className="mb-3 font-[family-name:var(--font-heading)] text-lg text-navy">Angaben</h2>
          <dl className="space-y-1 text-sm">
            <div className="text-muted">{customer.street}</div>
            <div className="text-muted">{customer.zip} {customer.city}</div>
            <div className="text-muted">{customer.phone}</div>
            <div className="pt-2"><span className="font-medium">Hund:</span> {customer.dogName || "—"}{customer.dogBreed ? `, ${customer.dogBreed}` : ""}{customer.dogAge ? `, ${customer.dogAge}` : ""}</div>
            {customer.dogProblems && <div className="pt-1 text-muted">Themen: {customer.dogProblems}</div>}
          </dl>
        </section>

        {/* Impfausweis */}
        <section className="rounded-[20px] border bg-white p-6">
          <h2 className="mb-3 font-[family-name:var(--font-heading)] text-lg text-navy">Impfausweis</h2>
          {customer.vaccinationImagePath ? (
            <a href={customer.vaccinationImagePath} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={customer.vaccinationImagePath} alt="Impfausweis" className="max-h-52 rounded-lg border object-contain" />
            </a>
          ) : (
            <p className="text-sm text-muted">Noch kein Foto hochgeladen.</p>
          )}
          <div className="mt-3">
            {customer.vaccinationApproved ? (
              <form action={approveVaccination}><input type="hidden" name="id" value={customer.id} /><input type="hidden" name="approved" value="0" /><span className="mr-3 rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">bestätigt ✓</span><button className="text-xs text-muted underline">Bestätigung zurücknehmen</button></form>
            ) : (
              <form action={approveVaccination}><input type="hidden" name="id" value={customer.id} /><input type="hidden" name="approved" value="1" /><button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white">Impfstatus bestätigen</button></form>
            )}
          </div>
        </section>
      </div>

      {/* Kurs-Freigaben */}
      <section className="rounded-[20px] border bg-white p-6">
        <h2 className="mb-1 font-[family-name:var(--font-heading)] text-lg text-navy">Kurs-Freigaben</h2>
        <p className="mb-4 text-sm text-muted">Steuere, welche Kurse dieser Kunde buchen kann. „Gesperrt" blendet den Kurs aus; „Absolviert" schaltet Folgekurse frei.</p>
        <div className="space-y-2">
          {courses.map((c) => {
            const st = accessOf(c.id);
            return (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-soft-2/40 px-3 py-2 text-sm">
                <span><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />{c.title}</span>
                <div className="flex gap-1">
                  {["UNLOCKED", "LOCKED", "COMPLETED"].map((s) => (
                    <form key={s} action={setCourseAccess}>
                      <input type="hidden" name="customerId" value={customer.id} />
                      <input type="hidden" name="courseId" value={c.id} />
                      <input type="hidden" name="status" value={s} />
                      <button className={`rounded px-2 py-1 text-xs ${st === s ? "bg-primary text-white" : "border hover:bg-white"}`}>
                        {s === "UNLOCKED" ? "buchbar" : s === "LOCKED" ? "gesperrt" : "absolviert"}
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Buchungen + Notiz + Sperren */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[20px] border bg-white p-6">
          <h2 className="mb-3 font-[family-name:var(--font-heading)] text-lg text-navy">Buchungen</h2>
          {customer.bookings.length === 0 ? <p className="text-sm text-muted">Keine.</p> : (
            <ul className="space-y-2 text-sm">
              {customer.bookings.map((b) => (
                <li key={b.id} className="flex justify-between rounded bg-soft-2/40 px-3 py-2">
                  <span>{b.session.course.title} – {formatDateTime(b.session.startsAt)}</span>
                  <span className="text-xs text-muted">{b.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-[20px] border bg-white p-6">
          <h2 className="mb-3 font-[family-name:var(--font-heading)] text-lg text-navy">Notiz &amp; Zugang</h2>
          <form action={saveCustomerNotes} className="space-y-2">
            <input type="hidden" name="id" value={customer.id} />
            <textarea name="notes" rows={3} defaultValue={customer.notes} placeholder="Interne Notiz …" className="w-full rounded-lg border px-3 py-2 text-sm" />
            <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white">Notiz speichern</button>
          </form>
          <div className="mt-4 border-t pt-3">
            {customer.status === "BLOCKED" ? (
              <form action={setCustomerStatus}><input type="hidden" name="id" value={customer.id} /><input type="hidden" name="status" value="ACTIVE" /><button className="text-xs text-green-700 hover:underline">Kunde entsperren</button></form>
            ) : (
              <form action={setCustomerStatus}><input type="hidden" name="id" value={customer.id} /><input type="hidden" name="status" value="BLOCKED" /><button className="text-xs text-red-600 hover:underline">Kunde sperren</button></form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
