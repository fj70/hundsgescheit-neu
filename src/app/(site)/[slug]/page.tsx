import type { Metadata } from "next";
import { PageView, getPageMeta } from "@/components/site/PageView";
import { db } from "@/lib/db";

// Reservierte Pfade, die eigene Routen haben (nicht als CMS-Seite behandeln)
const RESERVED = new Set(["blog", "termine", "admin", "api"]);

export async function generateStaticParams() {
  const pages = await db.page.findMany({
    where: { isPublished: true, slug: { notIn: ["home"] } },
    select: { slug: true },
  });
  return pages.filter((p) => !RESERVED.has(p.slug)).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getPageMeta(slug);
  return { title: meta?.title, description: meta?.description };
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PageView slug={slug} />;
}
