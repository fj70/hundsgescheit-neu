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

  const colors: { key: keyof typeof s; label: string }[] = [
    { key: "colorPrimary", label: "Primärfarbe" },
    { key: "colorSecondary", label: "Sekundärfarbe" },
    { key: "colorAccent", label: "Akzentfarbe" },
    { key: "colorNavy", label: "Dunkelblau (Überschriften)" },
  ];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-heading)] text-2xl text-primary">Einstellungen</h1>
      <p className="mt-1 text-muted">Kontaktdaten, Farben und SEO – auch wichtig fürs lokale Google-Ranking.</p>

      <form action={saveSettings} className="mt-6 space-y-6">
        {/* Hauptfarben */}
        <div className="rounded-[20px] border bg-white p-6">
          <h2 className="mb-1 font-[family-name:var(--font-heading)] text-lg text-navy">Hauptfarben</h2>
          <p className="mb-4 text-sm text-muted">Wirken auf die ganze Seite und erscheinen als Vorschläge im Text-Editor.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {colors.map((c) => (
              <div key={c.key}>
                <label className="mb-1 block text-sm font-medium">{c.label}</label>
                <div className="flex items-center gap-2">
                  <input type="color" name={c.key} defaultValue={s[c.key]} className="h-10 w-14 rounded border" />
                  <input name={`${c.key}_hex`} defaultValue={s[c.key]} readOnly className="w-24 rounded-lg border bg-soft-2/40 px-2 py-2 text-xs" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kontakt & SEO */}
        <div className="grid gap-4 rounded-[20px] border bg-white p-6 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
              <label className="mb-1 block text-sm font-medium">{f.label}</label>
              <input name={f.key} defaultValue={s[f.key]} className={input} />
            </div>
          ))}
        </div>

        <button className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white">Alles speichern</button>
      </form>
    </div>
  );
}
