import Link from "next/link";
import { db } from "@/lib/db";
import { createPage } from "@/app/admin/actions";

export default async function SeitenListe() {
  const pages = await db.page.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { sections: true } } } });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-heading)] text-2xl text-primary">Seiten</h1>
      <p className="mt-1 text-muted">Texte, Bilder und Abschnitte der Website bearbeiten.</p>

      <div className="mt-6 overflow-hidden rounded-[20px] border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-soft-2 text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Titel</th>
              <th className="px-4 py-3">Pfad</th>
              <th className="px-4 py-3">Abschnitte</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-muted">/{p.slug === "home" ? "" : p.slug}</td>
                <td className="px-4 py-3">{p._count.sections}</td>
                <td className="px-4 py-3">
                  {p.isPublished ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">öffentlich</span>
                  ) : (
                    <span className="rounded-full bg-soft-2 px-2 py-0.5 text-xs text-muted">Entwurf</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/seiten/${p.id}`} className="text-secondary hover:underline">Bearbeiten</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form action={createPage} className="mt-6 flex flex-wrap items-end gap-3 rounded-[20px] border bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Neue Seite</label>
          <input name="title" placeholder="Titel der Seite" required className="rounded-lg border px-3 py-2 text-sm" />
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Anlegen</button>
      </form>
    </div>
  );
}
