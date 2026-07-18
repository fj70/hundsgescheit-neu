import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { markEnquiryRead, deleteEnquiry } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminAnfragen() {
  const enquiries = await db.enquiry.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="font-[family-name:var(--font-heading)] text-2xl text-primary">Anfragen</h1>
      <p className="mt-1 text-muted">Nachrichten über das Kontaktformular.</p>

      <div className="mt-6 space-y-3">
        {enquiries.length === 0 && <p className="text-muted">Noch keine Anfragen.</p>}
        {enquiries.map((e) => (
          <div key={e.id} className={`rounded-[20px] border bg-white p-5 ${e.isRead ? "" : "border-primary/40"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-medium">{e.name}</span>
                {!e.isRead && <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">neu</span>}
                {e.subject && <span className="ml-2 text-sm text-muted">· {e.subject}</span>}
              </div>
              <span className="text-xs text-muted">{formatDateTime(e.createdAt)}</span>
            </div>
            <div className="mt-1 text-sm">
              <a href={`mailto:${e.email}`} className="text-secondary hover:underline">{e.email}</a>
              {e.phone && <span className="text-muted"> · {e.phone}</span>}
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{e.message}</p>
            <div className="mt-3 flex gap-3 border-t pt-3 text-xs">
              {!e.isRead && <form action={markEnquiryRead}><input type="hidden" name="id" value={e.id} /><button className="text-secondary hover:underline">Als gelesen markieren</button></form>}
              <form action={deleteEnquiry}><input type="hidden" name="id" value={e.id} /><button className="text-red-600 hover:underline">Löschen</button></form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
