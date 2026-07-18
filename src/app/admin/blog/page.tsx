import Link from "next/link";
import { db } from "@/lib/db";
import { createPost } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";

export default async function BlogListe() {
  const posts = await db.post.findMany({ orderBy: { updatedAt: "desc" } });
  return (
    <div>
      <h1 className="font-[family-name:var(--font-heading)] text-2xl text-primary">Blog</h1>
      <p className="mt-1 text-muted">Beiträge schreiben, bearbeiten und veröffentlichen.</p>

      <form action={createPost} className="mt-6 flex flex-wrap items-end gap-3 rounded-[20px] border bg-white p-5">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Neuer Beitrag</label>
          <input name="title" placeholder="Titel des Beitrags" required className="w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Schreiben</button>
      </form>

      <div className="mt-6 overflow-hidden rounded-[20px] border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-soft-2 text-left text-xs uppercase text-muted">
            <tr><th className="px-4 py-3">Titel</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Datum</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3">
                  {p.status === "PUBLISHED" ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">veröffentlicht</span>
                  ) : (
                    <span className="rounded-full bg-soft-2 px-2 py-0.5 text-xs text-muted">Entwurf</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">{p.publishedAt ? formatDate(p.publishedAt) : "—"}</td>
                <td className="px-4 py-3 text-right"><Link href={`/admin/blog/${p.id}`} className="text-secondary hover:underline">Bearbeiten</Link></td>
              </tr>
            ))}
            {posts.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-muted">Noch keine Beiträge.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
