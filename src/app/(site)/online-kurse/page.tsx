import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Online-Kurse",
  description: "Kurze Trainingsvideos zum Anschauen – Tricks, Alltag und mehr, jederzeit abrufbar.",
};

export default async function OnlineKurse() {
  const products = await db.videoProduct.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <section className="bg-soft py-16">
        <Container>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl text-primary sm:text-5xl">Online-Kurse</h1>
          <p className="mt-4 max-w-2xl text-muted">
            Kurze Trainingsvideos aus meinen Coachings – zum Anschauen, wann und so oft du willst.
            Als Stammkunde einmal kaufen und dauerhaft ansehen.
          </p>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          {products.length === 0 ? (
            <p className="text-muted">Die ersten Videos sind bald da – schau bald wieder vorbei!</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <Link key={p.id} href={`/online-kurse/${p.slug}`} className="group flex flex-col overflow-hidden rounded-[20px] border bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="relative aspect-video w-full bg-soft-2">
                    {p.coverPath && <Image src={p.coverPath} alt={p.title} fill sizes="400px" className="object-cover" />}
                    <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">{formatPrice(p.priceCents)}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-[family-name:var(--font-heading)] text-lg text-primary">{p.title}</h2>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{p.description}</p>
                    <span className="mt-4 text-sm font-semibold text-secondary">Ansehen &amp; kaufen →</span>
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
