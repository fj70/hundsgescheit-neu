import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SectionRenderer } from "@/components/sections/SectionRenderer";

// Laedt eine CMS-Seite per slug und rendert ihre Sektionen.
export async function PageView({ slug }: { slug: string }) {
  const page = await db.page.findUnique({
    where: { slug },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  if (!page || !page.isPublished) notFound();
  return <SectionRenderer sections={page.sections} />;
}

export async function getPageMeta(slug: string) {
  const page = await db.page.findUnique({
    where: { slug },
    select: { title: true, metaTitle: true, metaDescription: true, isPublished: true },
  });
  if (!page) return null;
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
  };
}
