import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/settings";

// Globales Teilen-Vorschaubild (OpenGraph / Twitter). Wird von Next automatisch
// als <meta og:image> für alle Seiten gesetzt, die kein eigenes OG-Bild mitbringen.
// So sehen geteilte Links in WhatsApp, Facebook & Co. hochwertig aus.

export const alt = "Hundsgescheit – Hundetraining mit Herz & Verstand";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const s = await getSettings().catch(() => null);
  const name = s?.siteName || "Hundsgescheit";
  const tagline = s?.tagline || "mit Herz und Verstand";
  const primary = s?.colorPrimary || "#125A70";
  const navy = s?.colorNavy || "#012D67";
  const accent = s?.colorAccent || "#70CFC0";
  const city = s?.city || "Essen";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "90px",
          background: `linear-gradient(135deg, ${navy} 0%, ${primary} 70%)`,
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* dekorativer Akzentkreis */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: accent,
            opacity: 0.22,
          }}
        />
        {/* Pfote */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <svg width="70" height="70" viewBox="0 0 24 24" fill={accent}>
            <path d="M8.5 5.5a1.8 1.8 0 1 1-3.6 0 1.8 1.8 0 0 1 3.6 0Zm10.6 0a1.8 1.8 0 1 1-3.6 0 1.8 1.8 0 0 1 3.6 0ZM5.2 10.9a1.7 1.7 0 1 1-3.4 0 1.7 1.7 0 0 1 3.4 0Zm17 0a1.7 1.7 0 1 1-3.4 0 1.7 1.7 0 0 1 3.4 0ZM12 11.4c2.3 0 4.6 2.6 4.6 4.7 0 1.6-1.3 2.2-2.6 2.2-1 0-1.4-.4-2-.4s-1 .4-2 .4c-1.3 0-2.6-.6-2.6-2.2 0-2.1 2.3-4.7 4.6-4.7Z" />
          </svg>
          <div style={{ fontSize: 30, letterSpacing: 2, textTransform: "uppercase", color: accent }}>
            {`Hundeschule ${city}`}
          </div>
        </div>
        <div style={{ fontSize: 104, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>{name}</div>
        <div style={{ fontSize: 46, marginTop: 20, color: "rgba(255,255,255,0.9)" }}>
          {`Hundetraining ${tagline}`}
        </div>
      </div>
    ),
    { ...size }
  );
}
