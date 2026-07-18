import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

export default async function AdminDashboard() {
  const session = await getSession();
  const now = new Date();

  const [upcoming, pendingBookings, unreadEnquiries, posts, nextSessions] = await Promise.all([
    db.courseSession.count({ where: { status: "SCHEDULED", startsAt: { gte: now } } }),
    db.booking.count({ where: { status: "PENDING" } }),
    db.enquiry.count({ where: { isRead: false } }),
    db.post.count({ where: { status: "PUBLISHED" } }),
    db.courseSession.findMany({
      where: { status: "SCHEDULED", startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      take: 6,
      include: {
        course: true,
        bookings: { where: { status: { in: ["PENDING", "CONFIRMED"] } }, select: { people: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Kommende Termine", value: upcoming, href: "/admin/termine" },
    { label: "Offene Buchungen", value: pendingBookings, href: "/admin/termine" },
    { label: "Neue Anfragen", value: unreadEnquiries, href: "/admin/anfragen" },
    { label: "Veröffentlichte Beiträge", value: posts, href: "/admin/blog" },
  ];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-heading)] text-2xl text-primary">
        Hallo {session?.name} 👋
      </h1>
      <p className="mt-1 text-muted">Hier siehst du alles Wichtige auf einen Blick.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-[20px] border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="font-[family-name:var(--font-heading)] text-3xl text-primary">{s.value}</div>
            <div className="mt-1 text-sm text-muted">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-heading)] text-lg text-navy">Nächste Termine</h2>
          <Link href="/admin/termine" className="text-sm text-secondary hover:underline">Alle ansehen</Link>
        </div>
        <div className="overflow-hidden rounded-[20px] border bg-white">
          {nextSessions.length === 0 ? (
            <p className="p-5 text-sm text-muted">Noch keine Termine geplant. <Link href="/admin/termine" className="text-primary underline">Jetzt anlegen</Link></p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-soft-2 text-left text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Kurs</th>
                  <th className="px-4 py-3">Termin</th>
                  <th className="px-4 py-3">Belegung</th>
                </tr>
              </thead>
              <tbody>
                {nextSessions.map((s) => {
                  const booked = s.bookings.reduce((sum, b) => sum + b.people, 0);
                  return (
                    <tr key={s.id} className="border-t">
                      <td className="px-4 py-3">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.course.color }} /> {s.course.title}
                      </td>
                      <td className="px-4 py-3">{formatDateTime(s.startsAt)}</td>
                      <td className="px-4 py-3">{booked} / {s.capacity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/blog" className="rounded-[20px] border bg-white p-5 hover:shadow-md">
          <div className="font-[family-name:var(--font-heading)] text-primary">Blogbeitrag schreiben</div>
          <p className="mt-1 text-sm text-muted">Neuen Beitrag verfassen und veröffentlichen.</p>
        </Link>
        <Link href="/admin/termine" className="rounded-[20px] border bg-white p-5 hover:shadow-md">
          <div className="font-[family-name:var(--font-heading)] text-primary">Termin anlegen</div>
          <p className="mt-1 text-sm text-muted">Neuen Kurstermin zum Buchen freigeben.</p>
        </Link>
        <Link href="/admin/seiten" className="rounded-[20px] border bg-white p-5 hover:shadow-md">
          <div className="font-[family-name:var(--font-heading)] text-primary">Seite bearbeiten</div>
          <p className="mt-1 text-sm text-muted">Texte, Bilder und Abschnitte ändern.</p>
        </Link>
      </div>
    </div>
  );
}
