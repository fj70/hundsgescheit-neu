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
  // Hauptfarben (zentral editierbar, wirken per CSS-Variablen auf die ganze Seite)
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorNavy: string;
  // E-Mail-Versand (SMTP) — im Backend unter Einstellungen pflegbar
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  smtpSecure: string; // "true" = SSL (Port 465), sonst STARTTLS
  mailTo: string; // Empfänger für Kontakt-/Buchungs-Benachrichtigungen (Standard: E-Mail)
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
  colorPrimary: "#125A70",
  colorSecondary: "#4B84A4",
  colorAccent: "#70CFC0",
  colorNavy: "#012D67",
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "",
  smtpSecure: "false",
  mailTo: "",
};

// Die editierbaren Hauptfarben als Palette (fuer Editor-Vorschlaege + CSS-Injektion).
export function colorPalette(s: SiteSettings) {
  return [
    { name: "Primär", key: "colorPrimary", color: s.colorPrimary },
    { name: "Sekundär", key: "colorSecondary", color: s.colorSecondary },
    { name: "Akzent", key: "colorAccent", color: s.colorAccent },
    { name: "Dunkelblau", key: "colorNavy", color: s.colorNavy },
  ];
}

// Etwas dunklere Variante fuer Hover (primary-dark) grob ableiten.
function darken(hex: string, amount = 24): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = Math.max(0, ((n >> 16) & 255) - amount);
  const g = Math.max(0, ((n >> 8) & 255) - amount);
  const b = Math.max(0, (n & 255) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// CSS-Variablen-Block aus den Farb-Settings (in <style> im Layout injizieren).
export function colorCssVars(s: SiteSettings): string {
  return `:root{--primary:${s.colorPrimary};--primary-dark:${darken(s.colorPrimary)};--secondary:${s.colorSecondary};--accent:${s.colorAccent};--navy:${s.colorNavy};}`;
}

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
