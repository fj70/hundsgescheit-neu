import { db } from "@/lib/db";
import { saveVideoProduct, deleteVideoProduct } from "@/app/admin/actions";
import { stripeConfigured } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";

const input = "w-full rounded-lg border bg-white px-3 py-2 text-sm";

function VideoForm({ p }: { p?: any }) {
  return (
    <form action={saveVideoProduct} className="grid gap-3 sm:grid-cols-2">
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-muted">Titel</label>
        <input name="title" defaultValue={p?.title ?? ""} className={input} required />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-muted">Beschreibung</label>
        <textarea name="description" rows={3} defaultValue={p?.description ?? ""} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Preis (€)</label>
        <input name="priceEuro" type="number" step="0.01" defaultValue={p ? (p.priceCents / 100).toFixed(2) : "10.00"} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Cover-Bildpfad (optional)</label>
        <input name="coverPath" defaultValue={p?.coverPath ?? ""} placeholder="/uploads/…" className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Video-Link (Vollversion, nach Kauf)</label>
        <input name="videoUrl" defaultValue={p?.videoUrl ?? ""} placeholder="Vimeo/YouTube-Embed-URL" className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Teaser-Link (öffentlich, optional)</label>
        <input name="previewUrl" defaultValue={p?.previewUrl ?? ""} placeholder="Embed-URL" className={input} />
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPublished" defaultChecked={p?.isPublished ?? false} /> Veröffentlicht</label>
      <div className="sm:col-span-2">
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Speichern</button>
      </div>
    </form>
  );
}

export default async function AdminVideos() {
  const products = await db.videoProduct.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { purchases: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl text-primary">Online-Kurse</h1>
        <p className="mt-1 text-muted">Bezahlte Trainingsvideos für deine Stammkunden.</p>
      </div>

      {!stripeConfigured() && (
        <div className="rounded-[20px] border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          <strong>Bezahlung noch nicht aktiv:</strong> Sobald der Stripe-Zugang (API-Keys) hinterlegt ist,
          können Kunden die Videos kaufen. Du kannst Videos schon anlegen und veröffentlichen –
          der Kauf-Button zeigt so lange „bald verfügbar".
        </div>
      )}

      {products.map((p) => (
        <details key={p.id} className="rounded-[20px] border bg-white p-5">
          <summary className="flex cursor-pointer items-center justify-between font-[family-name:var(--font-heading)] text-primary">
            <span>{p.title}</span>
            <span className="text-xs text-muted">{formatPrice(p.priceCents)} · {p._count.purchases} Käufe · {p.isPublished ? "öffentlich" : "Entwurf"}</span>
          </summary>
          <div className="mt-4"><VideoForm p={p} /></div>
          <form action={deleteVideoProduct} className="mt-3 border-t pt-3"><input type="hidden" name="id" value={p.id} /><button className="text-xs text-red-600 hover:underline">Video löschen</button></form>
        </details>
      ))}

      <details className="rounded-[20px] border border-dashed bg-white p-5">
        <summary className="cursor-pointer font-[family-name:var(--font-heading)] text-primary">+ Neues Video anlegen</summary>
        <div className="mt-4"><VideoForm /></div>
      </details>
    </div>
  );
}
