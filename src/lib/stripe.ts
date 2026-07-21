import "server-only";
import Stripe from "stripe";

// Stripe ist optional konfiguriert: erst wenn STRIPE_SECRET_KEY gesetzt ist, ist der Kauf aktiv.
// Ohne Key zeigt die Videothek „bald verfügbar" — sobald FJ die Keys hinterlegt, geht der Verkauf live.
const key = process.env.STRIPE_SECRET_KEY || "";

export const stripe = key ? new Stripe(key) : null;

export function stripeConfigured(): boolean {
  return !!key;
}
