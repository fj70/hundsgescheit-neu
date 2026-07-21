import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-auth";
import { formatPrice } from "@/lib/utils";
import { startCheckout } from "@/app/shop-actions";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await db.videoProduct.findUnique({ where: { slug } });
  return p ? { title: p.title, description: p.description } : {};
}

function VideoEmbed({ url }: { url: string }) {
  if (!url) return null;
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[20px] bg-black">
      <iframe src={url} className="absolute inset-0 h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
    </div>
  );
}

export default async function VideoDetail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ bought?: string; pending?: string }>;
}) {
  const { slug } = await params;
  const { bought, pending } = await searchParams;
  const product = await db.videoProduct.findUnique({ where: { slug } });
  if (!product || !product.isPublished) notFound();

  const session = await getCustomerSession();
  const purchase = session
    ? await db.purchase.findUnique({ where: { customerId_productId: { customerId: session.id, productId: product.id } } })
    : null;
  const owns = purchase?.status === "PAID" || bought === "1";

  return (
    <section className="py-14">
      <Container className="max-w-3xl">
        <Link href="/online-kurse" className="text-sm text-secondary hover:underline">← Alle Online-Kurse</Link>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl text-primary sm:text-4xl">{product.title}</h1>

        {bought === "1" && (
          <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">Vielen Dank für deinen Kauf! Das Video ist jetzt für dich freigeschaltet.</p>
        )}
        {pending === "1" && (
          <p className="mt-4 rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800">Der Kauf ist noch nicht möglich – der Bezahl-Anbieter wird gerade eingerichtet. Schau bald wieder vorbei.</p>
        )}

        <div className="mt-6">
          {owns ? (
            <>
              <VideoEmbed url={product.videoUrl} />
              {!product.videoUrl && <p className="text-muted">Das Video wird in Kürze hier verfügbar sein.</p>}
            </>
          ) : (
            <>
              {product.previewUrl ? <VideoEmbed url={product.previewUrl} /> : null}
              <div className="mt-6 rounded-[20px] border bg-soft p-6">
                <div className="prose-hg" dangerouslySetInnerHTML={{ __html: `<p>${product.description}</p>` }} />
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <span className="font-[family-name:var(--font-heading)] text-2xl text-primary">{formatPrice(product.priceCents)}</span>
                  {session ? (
                    <form action={startCheckout}>
                      <input type="hidden" name="productId" value={product.id} />
                      <button className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark">Jetzt kaufen</button>
                    </form>
                  ) : (
                    <Link href="/anmelden" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark">Zum Kaufen anmelden</Link>
                  )}
                </div>
                {!session && <p className="mt-3 text-xs text-muted">Videos kaufst du im Stammkunden-Bereich. Zugang bekommst du von Chiara.</p>}
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
