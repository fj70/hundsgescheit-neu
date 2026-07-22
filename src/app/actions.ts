"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ---------- Kontaktanfrage ----------
const contactSchema = z.object({
  name: z.string().min(2, "Bitte Namen angeben"),
  email: z.string().email("Bitte gültige E-Mail angeben"),
  phone: z.string().optional().default(""),
  subject: z.string().optional().default(""),
  message: z.string().min(5, "Bitte eine Nachricht schreiben"),
  agb: z.string().optional(),
});

export type FormState = { ok: boolean; error?: string; fieldErrors?: Record<string, string> };

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  // Honeypot: von Bots ausgefülltes verstecktes Feld -> stillschweigend „erfolgreich"
  if (String(formData.get("website") || "").trim()) return { ok: true };
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    subject: formData.get("subject") ?? "",
    message: formData.get("message"),
    agb: formData.get("agb") ?? undefined,
  });
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues) fe[String(i.path[0])] = i.message;
    return { ok: false, error: "Bitte prüfe deine Eingaben.", fieldErrors: fe };
  }
  if (!parsed.data.agb) {
    return { ok: false, error: "Bitte akzeptiere die AGB.", fieldErrors: { agb: "Erforderlich" } };
  }
  const d = parsed.data;
  await db.enquiry.create({
    data: { name: d.name, email: d.email, phone: d.phone, subject: d.subject, message: d.message },
  });

  // Benachrichtigung an Chiara + Bestätigung an Absender (falls SMTP hinterlegt)
  const { sendMail, notifyAddress, mailLayout } = await import("@/lib/mail");
  const to = await notifyAddress();
  if (to) {
    await sendMail({
      to,
      subject: `Neue Kontaktanfrage von ${d.name}`,
      replyTo: d.email,
      html: mailLayout("Neue Kontaktanfrage", `
        <p><b>Name:</b> ${d.name}</p>
        <p><b>E-Mail:</b> ${d.email}</p>
        ${d.phone ? `<p><b>Telefon:</b> ${d.phone}</p>` : ""}
        ${d.subject ? `<p><b>Betreff:</b> ${d.subject}</p>` : ""}
        <p><b>Nachricht:</b><br>${d.message.replace(/\n/g, "<br>")}</p>`),
    });
  }
  await sendMail({
    to: d.email,
    subject: "Danke für deine Nachricht – Hundsgescheit",
    html: mailLayout("Danke für deine Nachricht!", `
      <p>Hallo ${d.name},</p>
      <p>vielen Dank für deine Anfrage – ich melde mich zeitnah bei dir zurück.</p>
      <p>Liebe Grüße<br>Chiara</p>`),
  });
  return { ok: true };
}

// ---------- Newsletter-Anmeldung ----------
export async function subscribeNewsletter(_prev: FormState, formData: FormData): Promise<FormState> {
  if (String(formData.get("website") || "").trim()) return { ok: true };
  const email = String(formData.get("email") || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Bitte gültige E-Mail angeben." };
  }
  await db.enquiry.create({
    data: { name: "Newsletter", email, subject: "Newsletter-Anmeldung", message: "Newsletter-Anmeldung über den Footer." },
  });
  return { ok: true };
}

// ---------- Buchung eines Termins ----------
const bookingSchema = z.object({
  sessionId: z.string().min(1),
  customerName: z.string().min(2, "Bitte Namen angeben"),
  customerEmail: z.string().email("Bitte gültige E-Mail angeben"),
  customerPhone: z.string().optional().default(""),
  dogName: z.string().optional().default(""),
  people: z.coerce.number().int().min(1).max(10).default(1),
  notes: z.string().optional().default(""),
  agb: z.string().optional(),
});

export async function createBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = bookingSchema.safeParse({
    sessionId: formData.get("sessionId"),
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    customerPhone: formData.get("customerPhone") ?? "",
    dogName: formData.get("dogName") ?? "",
    people: formData.get("people") ?? 1,
    notes: formData.get("notes") ?? "",
    agb: formData.get("agb") ?? undefined,
  });
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues) fe[String(i.path[0])] = i.message;
    return { ok: false, error: "Bitte prüfe deine Eingaben.", fieldErrors: fe };
  }
  if (!parsed.data.agb) {
    return { ok: false, error: "Bitte akzeptiere die AGB.", fieldErrors: { agb: "Erforderlich" } };
  }

  // Kapazität prüfen (bestätigte + wartende Buchungen zählen)
  const session = await db.courseSession.findUnique({
    where: { id: parsed.data.sessionId },
    include: { bookings: { where: { status: { in: ["PENDING", "CONFIRMED"] } } }, course: true },
  });
  if (!session || session.status !== "SCHEDULED") {
    return { ok: false, error: "Dieser Termin ist nicht mehr buchbar." };
  }
  const booked = session.bookings.reduce((sum, b) => sum + b.people, 0);
  if (booked + parsed.data.people > session.capacity) {
    return { ok: false, error: "Für diesen Termin sind nicht mehr genügend Plätze frei." };
  }

  await db.booking.create({
    data: {
      sessionId: parsed.data.sessionId,
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      customerPhone: parsed.data.customerPhone,
      dogName: parsed.data.dogName,
      people: parsed.data.people,
      notes: parsed.data.notes,
      status: "PENDING",
    },
  });
  revalidatePath("/termine");
  // TODO: Bestätigungs-Mail an Kund:in + Info an Chiara (SMTP nach Umzug).
  return { ok: true };
}
