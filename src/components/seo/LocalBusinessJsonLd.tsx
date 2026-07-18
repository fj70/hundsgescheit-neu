import type { SiteSettings } from "@/lib/settings";

// Strukturierte Daten fuer lokale Suche (Google) — LocalBusiness/Dog Trainer.
// Verbessert lokale Sichtbarkeit + Rich Results ("in Essen").
export function LocalBusinessJsonLd({ settings }: { settings: SiteSettings }) {
  const base = process.env.SITE_URL || "http://localhost:3000";
  const data = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    name: `${settings.siteName} – Hundetraining`,
    description: settings.metaDescriptionDefault,
    slogan: settings.tagline,
    url: base,
    email: settings.email,
    ...(settings.phone ? { telephone: settings.phone } : {}),
    image: `${base}/uploads/2025/01/logo-1024x365.png`,
    logo: `${base}/uploads/2025/01/logo-1024x365.png`,
    areaServed: [
      { "@type": "City", name: settings.city || "Essen" },
      { "@type": "AdministrativeArea", name: settings.region || "Nordrhein-Westfalen" },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: settings.city || "Essen",
      addressRegion: settings.region || "NRW",
      postalCode: settings.zip || undefined,
      streetAddress: settings.street || undefined,
      addressCountry: "DE",
    },
    ...(settings.lat && settings.lng
      ? { geo: { "@type": "GeoCoordinates", latitude: settings.lat, longitude: settings.lng } }
      : {}),
    sameAs: [settings.instagram, settings.facebook].filter(Boolean),
    knowsAbout: [
      "Hundetraining",
      "Hundeschule",
      "Reaktive Hunde",
      "Einzelcoaching Hund",
      "Gruppencoaching Hund",
      "Social Walk",
      "Begleithundeprüfung",
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
