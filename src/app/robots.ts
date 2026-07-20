import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL || "http://localhost:3000";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/mein-bereich", "/registrieren", "/anmelden"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
