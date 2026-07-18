import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  const posts = await db.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug } });
  if (!post) return {};
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: post.coverImagePath ? { images: [post.coverImagePath] } : undefined,
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug }, include: { category: true } });
  if (!post || post.status !== "PUBLISHED") notFound();

  const more = await db.post.findMany({
    where: { status: "PUBLISHED", slug: { not: slug } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <article className="py-14">
      <Container className="max-w-3xl">
        <Link href="/blog" className="text-sm text-secondary hover:underline">← Alle Beiträge</Link>
        {post.category && <div className="mt-6 text-xs font-semibold uppercase tracking-wide text-secondary">{post.category.name}</div>}
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl text-primary sm:text-4xl">{post.title}</h1>
        {post.publishedAt && <div className="mt-3 text-sm text-muted">{formatDate(post.publishedAt)}</div>}
        {post.coverImagePath && (
          <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-[20px]">
            <Image src={post.coverImagePath} alt={post.coverImageAlt} fill sizes="768px" className="object-cover" priority />
          </div>
        )}
        <div className="prose-hg mt-8" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </Container>

      {more.length > 0 && (
        <Container className="mt-16">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl text-navy">Mehr Tipps</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {more.map((m) => (
              <Link key={m.id} href={`/blog/${m.slug}`} className="group flex flex-col overflow-hidden rounded-[20px] border bg-white shadow-sm hover:shadow-md">
                {m.coverImagePath && (
                  <div className="relative aspect-[16/10] w-full">
                    <Image src={m.coverImagePath} alt={m.coverImageAlt} fill sizes="300px" className="object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-[family-name:var(--font-heading)] text-base text-primary">{m.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      )}
    </article>
  );
}
