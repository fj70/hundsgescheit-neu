"use client";

import { useActionState } from "react";
import { submitContact, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/Button";

const initial: FormState = { ok: false };

const field = "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-primary";

export function ContactForm({ subjects }: { subjects: string[] }) {
  const [state, action, pending] = useActionState(submitContact, initial);

  if (state.ok) {
    return (
      <div className="rounded-[20px] border border-primary/30 bg-soft p-8 text-center">
        <h3 className="font-[family-name:var(--font-heading)] text-xl text-primary">Danke für deine Nachricht!</h3>
        <p className="mt-2 text-muted">Ich melde mich zeitnah bei dir zurück.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {/* Honeypot (für Menschen unsichtbar) */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <input name="name" placeholder="Dein Name" className={field} />
          {state.fieldErrors?.name && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name}</p>}
        </div>
        <div>
          <input name="email" type="email" placeholder="Deine E-Mail" className={field} />
          {state.fieldErrors?.email && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email}</p>}
        </div>
      </div>
      <input name="phone" placeholder="Telefonnummer (optional)" className={field} />
      <select name="subject" className={field} defaultValue="">
        <option value="">Anfrage zu … (optional)</option>
        {subjects.map((sub) => (
          <option key={sub} value={sub}>{sub}</option>
        ))}
      </select>
      <div>
        <textarea name="message" rows={5} placeholder="Deine Nachricht" className={field} />
        {state.fieldErrors?.message && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.message}</p>}
      </div>
      <label className="flex items-start gap-2 text-sm text-muted">
        <input type="checkbox" name="agb" value="1" className="mt-1" />
        <span>Ich akzeptiere die <a href="/agb" className="text-primary underline">AGB</a> und <a href="/datenschutz" className="text-primary underline">Datenschutzerklärung</a>.</span>
      </label>
      {state.fieldErrors?.agb && <p className="text-xs text-red-600">{state.fieldErrors.agb}</p>}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Wird gesendet …" : "Senden"}
      </Button>
    </form>
  );
}
