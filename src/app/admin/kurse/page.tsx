import { db } from "@/lib/db";
import { saveCourse, deleteCourse } from "@/app/admin/actions";

const input = "w-full rounded-lg border bg-white px-3 py-2 text-sm";

function CourseForm({ course }: { course?: any }) {
  return (
    <form action={saveCourse} className="grid gap-3 sm:grid-cols-2">
      {course && <input type="hidden" name="id" value={course.id} />}
      <div>
        <label className="mb-1 block text-xs text-muted">Titel</label>
        <input name="title" defaultValue={course?.title ?? ""} className={input} required />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Art</label>
        <select name="type" defaultValue={course?.type ?? "GRUPPE"} className={input}>
          <option value="EINZEL">Einzel</option>
          <option value="GRUPPE">Gruppe</option>
          <option value="ONLINE">Online</option>
          <option value="SOCIALWALK">Social Walk</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-muted">Kurzbeschreibung</label>
        <input name="shortDesc" defaultValue={course?.shortDesc ?? ""} className={input} />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-muted">Beschreibung</label>
        <textarea name="description" rows={3} defaultValue={course?.description ?? ""} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Preisangabe</label>
        <input name="priceLabel" defaultValue={course?.priceLabel ?? ""} placeholder="ab 20 €" className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Standard-Plätze</label>
        <input name="capacity" type="number" defaultValue={course?.capacity ?? 6} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Dauer (Min)</label>
        <input name="durationMin" type="number" defaultValue={course?.durationMin ?? 60} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Ort</label>
        <input name="location" defaultValue={course?.location ?? ""} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Kalenderfarbe</label>
        <input name="color" type="color" defaultValue={course?.color ?? "#125A70"} className="h-10 w-full rounded-lg border" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Bildpfad (optional)</label>
        <input name="imagePath" defaultValue={course?.imagePath ?? ""} placeholder="/uploads/…" className={input} />
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={course?.isActive ?? true} /> Aktiv</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isBookable" defaultChecked={course?.isBookable ?? true} /> Online buchbar</label>
      <div className="sm:col-span-2">
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Speichern</button>
      </div>
    </form>
  );
}

export default async function AdminKurse() {
  const courses = await db.course.findMany({ orderBy: { order: "asc" } });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl text-primary">Kurse</h1>
        <p className="mt-1 text-muted">Deine Angebote – Beschreibung, Preise und Plätze.</p>
      </div>

      {courses.map((c) => (
        <details key={c.id} className="rounded-[20px] border bg-white p-5">
          <summary className="flex cursor-pointer items-center justify-between font-[family-name:var(--font-heading)] text-primary">
            <span><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />{c.title}</span>
            <span className="text-xs text-muted">{c.isActive ? "aktiv" : "inaktiv"}</span>
          </summary>
          <div className="mt-4"><CourseForm course={c} /></div>
          <form action={deleteCourse} className="mt-3 border-t pt-3"><input type="hidden" name="id" value={c.id} /><button className="text-xs text-red-600 hover:underline">Kurs löschen</button></form>
        </details>
      ))}

      <details className="rounded-[20px] border border-dashed bg-white p-5">
        <summary className="cursor-pointer font-[family-name:var(--font-heading)] text-primary">+ Neuen Kurs anlegen</summary>
        <div className="mt-4"><CourseForm /></div>
      </details>
    </div>
  );
}
