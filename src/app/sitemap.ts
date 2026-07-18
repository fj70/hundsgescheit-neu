import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || "http://localhost:3000";
  const [pages, posts] = await Promise.all([
    db.page.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    db.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/termine`, priority: 0.9 },
    { url: `${base}/blog`, priority: 0.7 },
  ];

  const pageRoutes: MetadataRoute.Sitemap = pages
    .filter((p) => p.slug !== "home")
    .map((p) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt, priority: 0.8 }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    priority: 0.6,
  }));

  return [...staticRoutes, ...pageRoutes, ...postRoutes];
}
