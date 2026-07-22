import "server-only";
import nodemailer from "nodemailer";
import { getSettings } from "./settings";

// E-Mail-Versand über den im Backend hinterlegten SMTP-Zugang.
// Ist kein SMTP konfiguriert, wird nichts versendet (kein Fehler) — die Aktion
// (Kontakt, Buchung, Einladung) funktioniert trotzdem, es wird nur nichts gemailt.
export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  const s = await getSettings();
  if (!s.smtpHost || !s.smtpUser || !s.smtpPass) return false;

  try {
    const transporter = nodemailer.createTransport({
      host: s.smtpHost,
      port: Number(s.smtpPort || 587),
      secure: s.smtpSecure === "true",
      auth: { user: s.smtpUser, pass: s.smtpPass },
    });
    await transporter.sendMail({
      from: s.smtpFrom || s.smtpUser,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    return true;
  } catch (e) {
    console.error("Mail-Versand fehlgeschlagen:", (e as Error).message);
    return false;
  }
}

// Empfänger für interne Benachrichtigungen (Kontakt, Buchung).
export async function notifyAddress(): Promise<string> {
  const s = await getSettings();
  return s.mailTo || s.email || s.smtpUser;
}

// Einfaches Mail-Layout im Marken-Look.
export function mailLayout(title: string, bodyHtml: string): string {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#14202a">
    <div style="background:#125A70;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
      <div style="font-size:18px;font-weight:bold">Hundsgescheit</div>
    </div>
    <div style="border:1px solid #e2ebf0;border-top:0;border-radius:0 0 12px 12px;padding:24px">
      <h2 style="margin:0 0 12px;color:#012D67;font-size:18px">${title}</h2>
      ${bodyHtml}
    </div>
    <p style="color:#8a97a0;font-size:12px;text-align:center;margin-top:16px">Hundsgescheit – Hundetraining mit Herz &amp; Verstand</p>
  </div>`;
}
