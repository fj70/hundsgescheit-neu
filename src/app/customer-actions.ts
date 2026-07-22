"use server";

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, loginCustomer, logoutCustomer } from "@/lib/customer-auth";
import { slugify } from "@/lib/utils";
import type { FormState } from "./actions";

// ---------- Registrierung über Einladungs-Link ----------
const regSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Passwort mind. 8 Zeichen"),
  firstName: z.string().min(1, "Vorname fehlt"),
  lastName: z.string().min(1, "Nachname fehlt"),
  street: z.string().default(""),
  zip: z.string().default(""),
  city: z.string().default(""),
  phone: z.string().default(""),
  dogName: z.string().default(""),
  dogBreed: z.string().default(""),
  dogAge: z.string().default(""),
  dogProblems: z.string().default(""),
});

export async function registerCustomer(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = regSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues) fe[String(i.path[0])] = i.message;
    return { ok: false, error: "Bitte prüfe deine Eingaben.", fieldErrors: fe };
  }
  const d = parsed.data;
  const customer = await db.customer.findUnique({ where: { inviteToken: d.token } });
  if (!customer || customer.status === "BLOCKED") {
    return { ok: false, error: "Einladung ungültig oder abgelaufen." };
  }

  // Impfausweis-Foto (optional beim Absenden, aber gewünscht)
  let vaccinationImagePath = customer.vaccinationImagePath ?? null;
  const file = formData.get("vaccination");
  if (file instanceof File && file.size > 0 && file.type.startsWith("image/")) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const name = `${slugify(customer.id)}-${bytes.length.toString(36)}.${ext}`;
    const dir = join(process.cwd(), "public", "uploads", "impf");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, name), bytes);
    vaccinationImagePath = `/uploads/impf/${name}`;
  }

  await db.customer.update({
    where: { id: customer.id },
    data: {
      passwordHash: await hashPassword(d.password),
      status: "ACTIVE",
      inviteToken: null,
      firstName: d.firstName,
      lastName: d.lastName,
      street: d.street,
      zip: d.zip,
      city: d.city,
      phone: d.phone,
      dogName: d.dogName,
      dogBreed: d.dogBreed,
      dogAge: d.dogAge,
      dogProblems: d.dogProblems,
      vaccinationImagePath,
    },
  });
  await loginCustomer(customer.email, d.password);
  redirect("/mein-bereich");
}

// ---------- Login / Logout ----------
export async function customerLogin(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const s = await loginCustomer(email, password);
  if (!s) return { ok: false, error: "E-Mail oder Passwort falsch – oder noch nicht freigeschaltet." };
  redirect("/mein-bereich");
}

export async function customerLogout() {
  await logoutCustomer();
  redirect("/");
}

// ---------- Buchen als eingeloggter Stammkunde ----------
export async function bookAsCustomer(formData: FormData): Promise<void> {
  const { getCustomerSession } = await import("@/lib/customer-auth");
  const session = await getCustomerSession();
  if (!session) redirect("/anmelden");
  const sessionId = String(formData.get("sessionId"));
  const people = Math.max(1, Math.min(10, Number(formData.get("people") || 1)));

  const cs = await db.courseSession.findUnique({
    where: { id: sessionId },
    include: { bookings: { where: { status: { in: ["PENDING", "CONFIRMED"] } } }, course: true },
  });
  const customer = await db.customer.findUnique({ where: { id: session.id } });
  if (!cs || cs.status !== "SCHEDULED" || !customer) return;

  const booked = cs.bookings.reduce((s, b) => s + b.people, 0);
  if (booked + people > cs.capacity) return;

  await db.booking.create({
    data: {
      sessionId,
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`.trim() || customer.email,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      dogName: customer.dogName,
      people,
      status: "PENDING",
    },
  });

  // Bestätigung an Kund:in + Info an Chiara (falls SMTP hinterlegt)
  const { formatDateTime } = await import("@/lib/utils");
  const { sendMail, notifyAddress, mailLayout } = await import("@/lib/mail");
  const termin = `${cs.course.title} am ${formatDateTime(cs.startsAt)}`;
  await sendMail({
    to: customer.email,
    subject: `Buchungsanfrage erhalten – ${cs.course.title}`,
    html: mailLayout("Deine Buchungsanfrage ist da!", `
      <p>Hallo ${customer.firstName || ""},</p>
      <p>deine Anfrage für <b>${termin}</b> (${people} Pers.) ist eingegangen.
      Chiara bestätigt deinen Platz und meldet sich bei dir.</p>
      <p>Liebe Grüße<br>Chiara</p>`),
  });
  const to = await notifyAddress();
  if (to) {
    await sendMail({ to, subject: `Neue Buchung: ${termin}`, replyTo: customer.email,
      html: mailLayout("Neue Buchungsanfrage", `<p><b>${customer.firstName} ${customer.lastName}</b> (${customer.email})</p><p>${termin} · ${people} Pers.</p>`) });
  }
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/mein-bereich");
}
