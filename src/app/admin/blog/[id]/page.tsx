import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PostEditor } from "@/components/admin/PostEditor";
import { getSettings, colorPalette } from "@/lib/settings";

export default async function BlogEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, settings] = await Promise.all([
    db.post.findUnique({ where: { id } }),
    getSettings(),
  ]);
  if (!post) notFound();
  const palette = colorPalette(settings).map((c) => ({ name: c.name, color: c.color }));

  return (
    <div>
      <Link href="/admin/blog" className="text-sm text-secondary hover:underline">← Alle Beiträge</Link>
      <h1 className="mt-1 mb-6 font-[family-name:var(--font-heading)] text-2xl text-primary">Beitrag bearbeiten</h1>
      <div className="rounded-[20px] border bg-white p-6">
        <PostEditor
          post={{
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            contentHtml: post.contentHtml,
            coverImagePath: post.coverImagePath,
            coverImageAlt: post.coverImageAlt,
            metaTitle: post.metaTitle,
            metaDescription: post.metaDescription,
            status: post.status,
          }}
          palette={palette}
        />
      </div>
    </div>
  );
}
