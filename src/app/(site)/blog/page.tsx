import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Hundetraining-Tipps & Blog aus Essen",
  description: "Tipps, Wissen und Geschichten rund ums Hundetraining aus Essen – für ein starkes Team aus Mensch und Hund.",
};

export default async function BlogIndex() {
  const posts = await db.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  return (
    <>
      <section className="bg-soft py-16">
        <Container>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl text-primary sm:text-5xl">Blog &amp; Tipps</h1>
          <p className="mt-4 max-w-2xl text-muted">
            Gedanken, Wissen und Geschichten rund ums Hundetraining.
          </p>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          {posts.length === 0 ? (
            <p className="text-muted">Noch keine Beiträge veröffentlicht.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-[20px] border bg-white shadow-sm transition-shadow hover:shadow-md">
                  {p.coverImagePath && (
                    <div className="relative aspect-[16/10] w-full">
                      <Image src={p.coverImagePath} alt={p.coverImageAlt} fill sizes="400px" className="object-cover" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    {p.category && <span className="text-xs font-semibold uppercase tracking-wide text-secondary">{p.category.name}</span>}
                    <h2 className="mt-2 font-[family-name:var(--font-heading)] text-lg text-primary group-hover:text-primary-dark">{p.title}</h2>
                    <p className="mt-2 flex-1 text-sm text-muted">{p.excerpt}</p>
                    {p.publishedAt && <span className="mt-4 text-xs text-muted">{formatDate(p.publishedAt)}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
