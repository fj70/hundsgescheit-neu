// Sektions-System — das Herz des CMS.
// Jede Seite besteht aus Sektionen. Der `type` bestimmt Layout + Formularfelder.
// Das Feld-Schema unten treibt den generischen Editor UND dokumentiert die data-Form.

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "image"
  | "link"
  | "select"
  | "list"; // Wiederholgruppe (z.B. Karten, FAQ-Items)

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  help?: string;
  options?: { value: string; label: string }[]; // fuer select
  itemFields?: FieldDef[]; // fuer list
};

export type SectionTypeDef = {
  type: string;
  label: string;
  description: string;
  fields: FieldDef[];
  defaultData: Record<string, unknown>;
};

const linkFields: FieldDef[] = [
  { key: "label", label: "Button-Text", type: "text" },
  { key: "href", label: "Ziel (URL oder /pfad)", type: "text" },
];

export const SECTION_TYPES: SectionTypeDef[] = [
  {
    type: "HERO",
    label: "Hero (großer Kopfbereich)",
    description: "Große Überschrift mit Hintergrundbild und Buttons — meist ganz oben.",
    fields: [
      { key: "headline", label: "Überschrift", type: "text" },
      { key: "subline", label: "Unterzeile", type: "textarea" },
      { key: "image", label: "Hintergrundbild", type: "image" },
      { key: "primary", label: "Haupt-Button", type: "list", itemFields: linkFields },
      { key: "secondary", label: "Zweit-Button", type: "list", itemFields: linkFields },
    ],
    defaultData: {
      headline: "Hundetraining mit Herz und Verstand",
      subline: "Für ein starkes Team aus Mensch und Hund.",
      image: "",
      primary: [{ label: "Termine ansehen", href: "/termine" }],
      secondary: [{ label: "Kontakt", href: "/kontakt" }],
    },
  },
  {
    type: "RICHTEXT",
    label: "Textabschnitt",
    description: "Überschrift und formatierter Fließtext.",
    fields: [
      { key: "heading", label: "Überschrift", type: "text" },
      { key: "html", label: "Text", type: "richtext" },
    ],
    defaultData: { heading: "", html: "<p>Hier steht dein Text.</p>" },
  },
  {
    type: "IMAGE_TEXT",
    label: "Bild + Text",
    description: "Bild neben Text, Seite wählbar.",
    fields: [
      { key: "heading", label: "Überschrift", type: "text" },
      { key: "html", label: "Text", type: "richtext" },
      { key: "image", label: "Bild", type: "image" },
      { key: "imageAlt", label: "Bildbeschreibung (Alt)", type: "text" },
      {
        key: "imageSide",
        label: "Bild-Seite",
        type: "select",
        options: [
          { value: "left", label: "links" },
          { value: "right", label: "rechts" },
        ],
      },
    ],
    defaultData: { heading: "", html: "<p>Text neben dem Bild.</p>", image: "", imageAlt: "", imageSide: "right" },
  },
  {
    type: "CARDS",
    label: "Karten (Angebote/Leistungen)",
    description: "Mehrere Karten mit Titel, Text und Link — optional farbig (Angebotskacheln).",
    fields: [
      { key: "heading", label: "Überschrift", type: "text" },
      { key: "intro", label: "Einleitung", type: "textarea" },
      {
        key: "cards",
        label: "Karten",
        type: "list",
        itemFields: [
          { key: "title", label: "Titel", type: "text" },
          { key: "text", label: "Text", type: "textarea" },
          { key: "image", label: "Bild (optional)", type: "image" },
          { key: "href", label: "Link", type: "text" },
          {
            key: "color",
            label: "Farbe (für farbige Kachel)",
            type: "select",
            options: [
              { value: "", label: "— keine (weiße Karte) —" },
              { value: "einzel", label: "Grün (Einzelcoaching)" },
              { value: "online", label: "Navy (Onlinecoaching)" },
              { value: "gruppe", label: "Gold (Gruppencoaching)" },
              { value: "social", label: "Braun (Social Walk)" },
            ],
          },
        ],
      },
    ],
    defaultData: { heading: "Meine Angebote", intro: "", cards: [] },
  },
  {
    type: "PRICING",
    label: "Preis-Karten",
    description: "Farbige Preiskarten nebeneinander (Titel, Preis, Leistungs-Liste, Button).",
    fields: [
      { key: "eyebrow", label: "Kleine Zeile oben", type: "text" },
      { key: "heading", label: "Überschrift", type: "text" },
      {
        key: "cards",
        label: "Preiskarten",
        type: "list",
        itemFields: [
          { key: "title", label: "Titel", type: "text" },
          { key: "subtitle", label: "Untertitel", type: "text" },
          { key: "price", label: "Preis (z. B. ab 20 €)", type: "text" },
          { key: "priceNote", label: "Preis-Zusatz (z. B. pro Termin)", type: "text" },
          { key: "features", label: "Leistungen (eine pro Zeile)", type: "textarea" },
          { key: "href", label: "Button-Ziel", type: "text" },
          {
            key: "color",
            label: "Farbe",
            type: "select",
            options: [
              { value: "einzel", label: "Grün (Einzelcoaching)" },
              { value: "online", label: "Navy (Onlinecoaching)" },
              { value: "gruppe", label: "Gold (Gruppencoaching)" },
              { value: "social", label: "Braun (Social Walk)" },
            ],
          },
        ],
      },
    ],
    defaultData: { eyebrow: "Von nix kommt nix.", heading: "Unsere Preise im Überblick", cards: [] },
  },
  {
    type: "STEPS",
    label: "Ablauf / Schritte",
    description: "Nummerierte Schritte für einen Ablauf.",
    fields: [
      { key: "heading", label: "Überschrift", type: "text" },
      {
        key: "steps",
        label: "Schritte",
        type: "list",
        itemFields: [
          { key: "title", label: "Titel", type: "text" },
          { key: "text", label: "Text", type: "textarea" },
        ],
      },
    ],
    defaultData: { heading: "So läuft es ab", steps: [] },
  },
  {
    type: "STATS",
    label: "Zahlen / Fakten",
    description: "Kennzahlen nebeneinander (z.B. Jahre Erfahrung).",
    fields: [
      {
        key: "items",
        label: "Werte",
        type: "list",
        itemFields: [
          { key: "value", label: "Zahl/Wert", type: "text" },
          { key: "label", label: "Bezeichnung", type: "text" },
        ],
      },
    ],
    defaultData: { items: [] },
  },
  {
    type: "GALLERY",
    label: "Bildergalerie",
    description: "Mehrere Bilder als Galerie.",
    fields: [
      { key: "heading", label: "Überschrift", type: "text" },
      {
        key: "images",
        label: "Bilder",
        type: "list",
        itemFields: [
          { key: "src", label: "Bild", type: "image" },
          { key: "alt", label: "Beschreibung", type: "text" },
        ],
      },
    ],
    defaultData: { heading: "", images: [] },
  },
  {
    type: "TESTIMONIALS",
    label: "Kundenstimmen",
    description: "Zitate zufriedener Kund:innen.",
    fields: [
      { key: "heading", label: "Überschrift", type: "text" },
      {
        key: "items",
        label: "Stimmen",
        type: "list",
        itemFields: [
          { key: "quote", label: "Zitat", type: "textarea" },
          { key: "author", label: "Name", type: "text" },
        ],
      },
    ],
    defaultData: { heading: "Das sagen meine Kund:innen", items: [] },
  },
  {
    type: "FAQ",
    label: "FAQ (Fragen & Antworten)",
    description: "Aufklappbare Fragen — gut für SEO.",
    fields: [
      { key: "heading", label: "Überschrift", type: "text" },
      {
        key: "items",
        label: "Fragen",
        type: "list",
        itemFields: [
          { key: "q", label: "Frage", type: "text" },
          { key: "a", label: "Antwort", type: "textarea" },
        ],
      },
    ],
    defaultData: { heading: "Häufige Fragen", items: [] },
  },
  {
    type: "COURSES",
    label: "Kurse & Termine",
    description: "Zeigt die buchbaren Kurse mit nächsten Terminen automatisch an.",
    fields: [
      { key: "heading", label: "Überschrift", type: "text" },
      { key: "intro", label: "Einleitung", type: "textarea" },
    ],
    defaultData: { heading: "Kurse & Termine", intro: "" },
  },
  {
    type: "CTA",
    label: "Aufruf (Call-to-Action)",
    description: "Farbiger Block mit Aufforderung und Button.",
    fields: [
      { key: "heading", label: "Überschrift", type: "text" },
      { key: "text", label: "Text", type: "textarea" },
      { key: "cta", label: "Button", type: "list", itemFields: linkFields },
    ],
    defaultData: { heading: "Bereit loszulegen?", text: "", cta: [{ label: "Kontakt aufnehmen", href: "/kontakt" }] },
  },
  {
    type: "CONTACT",
    label: "Kontakt (Formular + Infos)",
    description: "Kontaktformular mit Adresse, Karte und Öffnungszeiten.",
    fields: [
      { key: "heading", label: "Überschrift", type: "text" },
      { key: "text", label: "Text", type: "textarea" },
    ],
    defaultData: { heading: "Kontakt", text: "Schreib mir – ich melde mich zeitnah zurück." },
  },
];

export const SECTION_TYPE_MAP: Record<string, SectionTypeDef> = Object.fromEntries(
  SECTION_TYPES.map((s) => [s.type, s]),
);

export function parseSectionData(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

export function defaultDataFor(type: string): Record<string, unknown> {
  return structuredClone(SECTION_TYPE_MAP[type]?.defaultData ?? {});
}
