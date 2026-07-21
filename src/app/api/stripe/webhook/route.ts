import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

// Stripe ruft diese Route nach erfolgreicher Zahlung auf -> Kauf auf PAID setzen.
// Voraussetzung: STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET gesetzt und die Route als
// Webhook-Endpoint im Stripe-Dashboard hinterlegt (Event checkout.session.completed).
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe nicht konfiguriert" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", secret);
  } catch {
    return NextResponse.json({ error: "Ungültige Signatur" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as { id: string; metadata?: { customerId?: string; productId?: string } };
    const customerId = s.metadata?.customerId;
    const productId = s.metadata?.productId;
    if (customerId && productId) {
      await db.purchase.updateMany({
        where: { customerId, productId },
        data: { status: "PAID" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
