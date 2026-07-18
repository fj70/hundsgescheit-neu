import { getSettings } from "@/lib/settings";
import { saveSettings } from "@/app/admin/actions";

const input = "w-full rounded-lg border bg-white px-3 py-2 text-sm";

export default async function AdminEinstellungen() {
  const s = await getSettings();
  const fields: { key: keyof typeof s; label: string; wide?: boolean }[] = [
    { key: "siteName", label: "Name" },
    { key: "tagline", label: "Claim / Slogan" },
    { key: "email", label: "E-Mail" },
    { key: "phone", label: "Telefon" },
    { key: "street", label: "Straße" },
    { key: "zip", label: "PLZ" },
    { key: "city", label: "Ort" },
    { key: "region", label: "Region/Bundesland" },
    { key: "lat", label: "Breitengrad (lat)" },
    { key: "lng", label: "Längengrad (lng)" },
    { key: "instagram", label: "Instagram-URL", wide: true },
    { key: "facebook", label: "Facebook-URL", wide: true },
    { key: "openingHours", label: "Öffnungszeiten / Verfügbarkeit", wide: true },
    { key: "metaTitleDefault", label: "Standard-SEO-Titel", wide: true },
    { key: "metaDescriptionDefault", label: "Standard-SEO-Beschreibung", wide: true },
  ];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-heading)] text-2xl text-primary">Einstellungen</h1>
      <p className="mt-1 text-muted">Kontaktdaten und SEO – auch wichtig fürs lokale Google-Ranking.</p>

      <form action={saveSettings} className="mt-6 grid gap-4 rounded-[20px] border bg-white p-6 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
            <label className="mb-1 block text-sm font-medium">{f.label}</label>
            <input name={f.key} defaultValue={s[f.key]} className={input} />
          </div>
        ))}
        <div className="sm:col-span-2">
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Speichern</button>
        </div>
      </form>
    </div>
  );
}
