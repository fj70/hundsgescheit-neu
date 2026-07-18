import { db } from "./db";

// Globale Einstellungen als Key-Value. Werte sind Strings (JSON fuer komplexe Werte).
export type SiteSettings = {
  siteName: string;
  tagline: string;
  phone: string;
  email: string;
  street: string;
  zip: string;
  city: string;
  region: string;
  country: string;
  lat: string;
  lng: string;
  openingHours: string; // frei formatiert
  instagram: string;
  facebook: string;
  metaTitleDefault: string;
  metaDescriptionDefault: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Hundsgescheit",
  tagline: "mit Herz und Verstand",
  phone: "",
  email: "info@hundsgescheit.de",
  street: "",
  zip: "",
  city: "",
  region: "",
  country: "Deutschland",
  lat: "",
  lng: "",
  openingHours: "",
  instagram: "",
  facebook: "",
  metaTitleDefault: "Hundsgescheit – Hundetraining mit Herz und Verstand",
  metaDescriptionDefault:
    "Hundetraining mit Herz und Verstand. Einzel-, Gruppen- und Onlinecoaching sowie Socialwalks.",
};

export async function getSettings(): Promise<SiteSettings> {
  const rows = await db.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULT_SETTINGS, ...map } as SiteSettings;
}

export async function setSetting(key: string, value: string) {
  await db.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function setSettings(values: Partial<SiteSettings>) {
  await Promise.all(Object.entries(values).map(([k, v]) => setSetting(k, String(v ?? ""))));
}
