import { db } from "@/lib/db";
import { MediaUpload } from "@/components/admin/MediaUpload";

export const dynamic = "force-dynamic";

export default async function AdminMedien() {
  const assets = await db.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl text-primary">Medien</h1>
          <p className="mt-1 text-muted">Bilder für Seiten und Blog.</p>
        </div>
        <MediaUpload />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {assets.map((a) => (
          <div key={a.id} className="group relative aspect-square overflow-hidden rounded-lg border bg-soft-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.path} alt={a.title} className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-1 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100">
              {a.path}
            </div>
          </div>
        ))}
        {assets.length === 0 && <p className="col-span-full text-sm text-muted">Noch keine Medien hochgeladen. (Die bestehenden Website-Bilder liegen bereits unter /uploads.)</p>}
      </div>
    </div>
  );
}
