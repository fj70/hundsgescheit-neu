import Link from "next/link";
import { db } from "@/lib/db";
import { inviteCustomer } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminKunden() {
  const customers = await db.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true } } },
  });

  const badge = (s: string) =>
    s === "ACTIVE" ? "bg-green-100 text-green-700" : s === "BLOCKED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";
  const label = (s: string) => (s === "ACTIVE" ? "aktiv" : s === "BLOCKED" ? "gesperrt" : "eingeladen");

  return (
    <div>
      <h1 className="font-[family-name:var(--font-heading)] text-2xl text-primary">Stammkunden</h1>
      <p className="mt-1 text-muted">Zugang zum Buchungsbereich – nur per Einladung. Erstkontakt läuft über das Kontaktformular.</p>

      {/* Einladen */}
      <form action={inviteCustomer} className="mt-6 flex flex-wrap items-end gap-3 rounded-[20px] border bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Neuen Kunden einladen</label>
          <input name="email" type="email" placeholder="E-Mail" required className="rounded-lg border px-3 py-2 text-sm" />
        </div>
        <input name="firstName" placeholder="Vorname (optional)" className="rounded-lg border px-3 py-2 text-sm" />
        <input name="lastName" placeholder="Nachname (optional)" className="rounded-lg border px-3 py-2 text-sm" />
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Einladen</button>
      </form>

      <div className="mt-6 overflow-hidden rounded-[20px] border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-soft-2 text-left text-xs uppercase text-muted">
            <tr><th className="px-4 py-3">Name / E-Mail</th><th className="px-4 py-3">Hund</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Impf</th><th className="px-4 py-3">Buchungen</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium">{`${c.firstName} ${c.lastName}`.trim() || "—"}</div>
                  <div className="text-xs text-muted">{c.email}</div>
                </td>
                <td className="px-4 py-3 text-muted">{c.dogName || "—"}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${badge(c.status)}`}>{label(c.status)}</span></td>
                <td className="px-4 py-3">{c.vaccinationApproved ? "✓" : "—"}</td>
                <td className="px-4 py-3">{c._count.bookings}</td>
                <td className="px-4 py-3 text-right"><Link href={`/admin/kunden/${c.id}`} className="text-secondary hover:underline">Öffnen</Link></td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">Noch keine Kunden eingeladen.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
