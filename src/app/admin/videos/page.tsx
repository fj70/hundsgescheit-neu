import { db } from "@/lib/db";
import { saveVideoProduct, deleteVideoProduct, releasePurchase, cancelPurchase } from "@/app/admin/actions";
import { stripeConfigured } from "@/lib/stripe";
import { formatPrice, formatDateTime } from "@/lib/utils";

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
  const [products, pendingPurchases] = await Promise.all([
    db.videoProduct.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { _count: { select: { purchases: true } } },
    }),
    db.purchase.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { product: true, customer: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl text-primary">Online-Kurse</h1>
        <p className="mt-1 text-muted">Bezahlte Trainingsvideos für deine Stammkunden.</p>
      </div>

      {!stripeConfigured() && (
        <div className="rounded-[20px] border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          <strong>Online-Bezahlung noch nicht aktiv:</strong> Sobald der Stripe-Zugang (API-Keys) hinterlegt ist,
          können Kunden direkt online kaufen. <strong>Barzahlung funktioniert aber schon jetzt</strong> –
          Kunden fragen an, du schaltest nach Zahlungseingang unten frei.
        </div>
      )}

      {/* Offene Zahlungen — vor allem Barzahlungen manuell freischalten */}
      <div className="rounded-[20px] border bg-white p-5">
        <h2 className="font-[family-name:var(--font-heading)] text-lg text-navy">Offene Zahlungen</h2>
        {pendingPurchases.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Aktuell keine offenen Zahlungen.</p>
        ) : (
          <ul className="mt-3 divide-y">
            {pendingPurchases.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <div className="font-semibold text-navy">{p.product.title} · {formatPrice(p.amountCents || p.product.priceCents)}</div>
                  <div className="text-muted">
                    {p.customer.firstName} {p.customer.lastName} ({p.customer.email}) ·{" "}
                    <span className={`rounded-full px-2 py-0.5 text-xs ${p.paymentMethod === "CASH" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
                      {p.paymentMethod === "CASH" ? "Barzahlung" : p.paymentMethod === "PAYPAL" ? "PayPal" : "Online"}
                    </span>{" "}
                    · angefragt {formatDateTime(p.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <form action={releasePurchase}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-700">Zahlung bestätigt · freischalten</button>
                  </form>
                  <form action={cancelPurchase}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="rounded-full border px-3 py-1.5 text-xs text-muted hover:bg-soft">Ablehnen</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

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
