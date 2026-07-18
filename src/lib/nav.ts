import { db } from "./db";
import type { NavItem } from "@/components/site/Header";

const COACHING = ["einzelcoaching", "gruppencoaching", "onlinecoaching", "socialwalk"];

// Baut die Hauptnavigation aus den veroeffentlichten Seiten (showInNav, order).
// "dienstleistungen" bekommt die vier Coaching-Seiten als Dropdown.
export async function getNav(): Promise<NavItem[]> {
  const pages = await db.page.findMany({
    where: { isPublished: true, showInNav: true },
    orderBy: { order: "asc" },
    select: { slug: true, title: true, navLabel: true },
  });

  const bySlug = new Map(pages.map((p) => [p.slug, p]));
  const nav: NavItem[] = [];

  for (const p of pages) {
    if (COACHING.includes(p.slug)) continue; // erscheinen als Kinder von dienstleistungen
    const href = p.slug === "home" ? "/" : `/${p.slug}`;
    const label = p.navLabel || p.title;
    if (p.slug === "dienstleistungen") {
      nav.push({
        label,
        href,
        children: COACHING.filter((s) => bySlug.has(s)).map((s) => ({
          label: bySlug.get(s)!.navLabel || bySlug.get(s)!.title,
          href: `/${s}`,
        })),
      });
    } else {
      nav.push({ label, href });
    }
  }
  return nav;
}
