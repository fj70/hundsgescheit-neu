"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-auth";
import { stripe, stripeConfigured } from "@/lib/stripe";

// Kauf eines Videos starten: erzeugt eine Stripe-Checkout-Session (nur eingeloggte Stammkunden).
export async function startCheckout(formData: FormData): Promise<void> {
  const session = await getCustomerSession();
  if (!session) redirect("/anmelden");
  const productId = String(formData.get("productId"));

  const [product, customer] = await Promise.all([
    db.videoProduct.findUnique({ where: { id: productId } }),
    db.customer.findUnique({ where: { id: session.id } }),
  ]);
  if (!product || !product.isPublished || !customer) redirect("/online-kurse");

  // Bereits gekauft? -> direkt ansehen
  const existing = await db.purchase.findUnique({
    where: { customerId_productId: { customerId: customer.id, productId } },
  });
  if (existing?.status === "PAID") redirect(`/online-kurse/${product.slug}`);

  if (!stripeConfigured() || !stripe) {
    // Ohne Stripe-Keys: Kauf noch nicht möglich
    redirect(`/online-kurse/${product.slug}?pending=1`);
  }

  const base = process.env.SITE_URL || "http://localhost:3000";
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customer.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: product.priceCents,
          product_data: { name: product.title, description: product.description || undefined },
        },
      },
    ],
    metadata: { customerId: customer.id, productId: product.id },
    success_url: `${base}/online-kurse/${product.slug}?bought=1`,
    cancel_url: `${base}/online-kurse/${product.slug}`,
  });

  await db.purchase.upsert({
    where: { customerId_productId: { customerId: customer.id, productId } },
    update: { status: "PENDING", stripeSessionId: checkout.id, amountCents: product.priceCents },
    create: { customerId: customer.id, productId, status: "PENDING", stripeSessionId: checkout.id, amountCents: product.priceCents },
  });

  redirect(checkout.url!);
}
