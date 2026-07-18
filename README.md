# hundsgescheit.de – Neubau (Next.js)

Eigenständiger Nachbau von hundsgescheit.de mit eigenem CMS, Buchungssystem und Kundin-Dashboard.
Ersetzt die bisherige WordPress-Seite. Design 1:1 zum Original (Petrol/Blau, Bowlby One SC /
Outfit / Fuzzy Bubbles).

## Stack
- **Next.js 16** (App Router, Turbopack, Standalone-Output)
- **TypeScript + Tailwind v4**
- **Prisma 7 + SQLite** (better-sqlite3 Adapter) – migrierbar zu MySQL
- **Auth**: eigene Session (JWT via jose, bcrypt), geschützt über `src/proxy.ts`

## Lokal starten
```bash
npm install
npx prisma migrate dev      # DB anlegen
npx tsx prisma/seed.ts      # Demo-Inhalte + Kurse + Termine
npm run dev                 # http://localhost:3000
```

## Logins (Verwaltung unter /admin)
- **Chiara (OWNER):** chiara@hundsgescheit.de / `hundsgescheit2026`
- **FJ (ADMIN):** admin@fjdesign.de / `fjdesign2026`
> Passwörter nach dem ersten Login ändern. In Produktion via `SEED_OWNER_PASSWORD` /
> `SEED_ADMIN_PASSWORD` (Build-Zeit-Env) setzen.

## Architektur (Kurz)
- **Öffentliche Seiten** kommen aus der DB: `Page` → `Section[]`. Der `SectionRenderer`
  (`src/components/sections/`) rendert 13 Sektionstypen (HERO, CARDS, IMAGE_TEXT, COURSES,
  CONTACT, FAQ, …). Neue Abschnitte fügt die Kundin im Admin hinzu.
- **Sektions-Schema** in `src/lib/sections.ts` treibt den generischen Editor (`SectionEditor`).
- **Buchung**: `Course` → `CourseSession` (Termin) → `Booking`. Öffentlich unter `/termine`,
  Verwaltung unter `/admin/termine`.
- **Blog**: `Post` (+ `Category`), Editor unter `/admin/blog`.
- **Medien**: Upload nach `public/uploads/cms` über `/api/upload`, Bibliothek unter `/admin/medien`.
- **SEO/GEO**: `sitemap.ts`, `robots.ts`, LocalBusiness-JSON-LD (`src/components/seo/`),
  Per-Page-Metadata, deutsche lokale Keywords (Essen).

## Deploy (Coolify)
- `Dockerfile` (Multi-Stage, Standalone) + `docker-entrypoint.sh`.
- DB wird **zur Build-Zeit** geseedet (`prisma/seed-content/`) und beim ersten Start aufs
  Volume kopiert. **Ohne** gemountetes `/app/data`-Volume startet die Seite bei jedem Deploy
  frisch mit den Demo-Inhalten (gewollt für die Test-Subdomain).
- Für **echten** Betrieb: Volume auf `/app/data` (DB) **und** `/app/public/uploads/cms`
  (Uploads) mounten, damit Änderungen/Buchungen persistent sind.
- Env: `AUTH_SECRET`, `SITE_URL`. Optional Build-Zeit: `SEED_OWNER_PASSWORD`, `SEED_ADMIN_PASSWORD`.

## Bilder
`public/uploads` enthält nur die auf der Seite referenzierten Fotos (schlank für Git).
Die vollständige Bildbibliothek liegt lokal unter `../wp-content-full/uploads` und kann bei
Bedarf ins Uploads-Volume gespielt werden.

## Migration zu MySQL (später)
`provider = "mysql"` in `prisma/schema.prisma`, `DATABASE_URL` auf MySQL, `prisma migrate`.
Statusfelder sind bereits Strings (SQLite-kompatibel), daher problemlos portierbar.
