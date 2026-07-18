import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SECTION_TYPES, SECTION_TYPE_MAP } from "@/lib/sections";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { getSettings, colorPalette } from "@/lib/settings";
import {
  updatePageMeta, deletePage, addSection, deleteSection, toggleSection, moveSection,
} from "@/app/admin/actions";

export default async function SeitenEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [page, settings] = await Promise.all([
    db.page.findUnique({ where: { id }, include: { sections: { orderBy: { order: "asc" } } } }),
    getSettings(),
  ]);
  if (!page) notFound();
  const palette = colorPalette(settings).map((c) => ({ name: c.name, color: c.color }));

  const inputCls = "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/seiten" className="text-sm text-secondary hover:underline">← Alle Seiten</Link>
          <h1 className="mt-1 font-[family-name:var(--font-heading)] text-2xl text-primary">{page.title}</h1>
        </div>
        <Link href={page.slug === "home" ? "/" : `/${page.slug}`} target="_blank" className="text-sm text-secondary hover:underline">
          Ansehen ↗
        </Link>
      </div>

      {/* Seiten-Einstellungen */}
      <section className="rounded-[20px] border bg-white p-6">
        <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg text-navy">Seiten-Einstellungen</h2>
        <form action={updatePageMeta} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={page.id} />
          <div>
            <label className="mb-1 block text-sm font-medium">Titel</label>
            <input name="title" defaultValue={page.title} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Menü-Beschriftung (optional)</label>
            <input name="navLabel" defaultValue={page.navLabel ?? ""} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">SEO-Titel</label>
            <input name="metaTitle" defaultValue={page.metaTitle ?? ""} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Reihenfolge im Menü</label>
            <input name="order" type="number" defaultValue={page.order} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">SEO-Beschreibung</label>
            <textarea name="metaDescription" rows={2} defaultValue={page.metaDescription ?? ""} className={inputCls} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublished" defaultChecked={page.isPublished} /> Öffentlich sichtbar
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="showInNav" defaultChecked={page.showInNav} /> Im Hauptmenü zeigen
          </label>
          <div className="sm:col-span-2">
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Speichern</button>
          </div>
        </form>
      </section>

      {/* Abschnitte */}
      <section>
        <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg text-navy">Abschnitte</h2>
        <div className="space-y-4">
          {page.sections.map((sec, i) => (
            <div key={sec.id} className={`rounded-[20px] border bg-white p-6 ${sec.isVisible ? "" : "opacity-60"}`}>
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <div className="font-[family-name:var(--font-heading)] text-primary">
                  {SECTION_TYPE_MAP[sec.type]?.label ?? sec.type}
                  {!sec.isVisible && <span className="ml-2 text-xs text-muted">(ausgeblendet)</span>}
                </div>
                <div className="flex items-center gap-1">
                  <form action={moveSection}><input type="hidden" name="id" value={sec.id} /><input type="hidden" name="pageId" value={page.id} /><input type="hidden" name="dir" value="up" /><button disabled={i === 0} className="rounded px-2 py-1 text-sm hover:bg-soft-2 disabled:opacity-30">↑</button></form>
                  <form action={moveSection}><input type="hidden" name="id" value={sec.id} /><input type="hidden" name="pageId" value={page.id} /><input type="hidden" name="dir" value="down" /><button disabled={i === page.sections.length - 1} className="rounded px-2 py-1 text-sm hover:bg-soft-2 disabled:opacity-30">↓</button></form>
                  <form action={toggleSection}><input type="hidden" name="id" value={sec.id} /><input type="hidden" name="pageId" value={page.id} /><button className="rounded px-2 py-1 text-xs hover:bg-soft-2">{sec.isVisible ? "Ausblenden" : "Einblenden"}</button></form>
                  <form action={deleteSection}><input type="hidden" name="id" value={sec.id} /><input type="hidden" name="pageId" value={page.id} /><button className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50">Löschen</button></form>
                </div>
              </div>
              <SectionEditor section={{ id: sec.id, pageId: page.id, type: sec.type, data: sec.data }} palette={palette} />
            </div>
          ))}
        </div>

        {/* Abschnitt hinzufügen */}
        <form action={addSection} className="mt-4 flex flex-wrap items-end gap-3 rounded-[20px] border border-dashed bg-white p-5">
          <input type="hidden" name="pageId" value={page.id} />
          <div>
            <label className="mb-1 block text-sm font-medium">Abschnitt hinzufügen</label>
            <select name="type" className={inputCls}>
              {SECTION_TYPES.map((t) => (
                <option key={t.type} value={t.type}>{t.label}</option>
              ))}
            </select>
          </div>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Hinzufügen</button>
        </form>
      </section>

      {!page.isSystem && (
        <form action={deletePage} className="border-t pt-6">
          <input type="hidden" name="id" value={page.id} />
          <button className="text-sm text-red-600 hover:underline">Diese Seite löschen</button>
        </form>
      )}
    </div>
  );
}
