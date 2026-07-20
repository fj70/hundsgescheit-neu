"use client";

import { useActionState } from "react";
import { registerCustomer } from "@/app/customer-actions";
import type { FormState } from "@/app/actions";
import { Button } from "@/components/ui/Button";

const initial: FormState = { ok: false };
const field = "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-primary";

function Err({ state, name }: { state: FormState; name: string }) {
  return state.fieldErrors?.[name] ? <p className="mt-1 text-xs text-red-600">{state.fieldErrors[name]}</p> : null;
}

export function RegistrationForm({ token, email }: { token: string; email: string }) {
  const [state, action, pending] = useActionState(registerCustomer, initial);

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="token" value={token} />

      <section>
        <h2 className="mb-3 font-[family-name:var(--font-heading)] text-lg text-navy">Zugangsdaten</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">E-Mail</label>
            <input value={email} readOnly className={`${field} bg-soft-2/50`} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Passwort wählen</label>
            <input name="password" type="password" placeholder="mind. 8 Zeichen" className={field} />
            <Err state={state} name="password" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-[family-name:var(--font-heading)] text-lg text-navy">Deine Angaben</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><input name="firstName" placeholder="Vorname" className={field} /><Err state={state} name="firstName" /></div>
          <div><input name="lastName" placeholder="Nachname" className={field} /><Err state={state} name="lastName" /></div>
          <input name="street" placeholder="Straße und Hausnummer" className={field} />
          <div className="grid grid-cols-3 gap-3">
            <input name="zip" placeholder="PLZ" className={field} />
            <input name="city" placeholder="Ort" className={`${field} col-span-2`} />
          </div>
          <input name="phone" placeholder="Telefon" className={`${field} sm:col-span-2`} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-[family-name:var(--font-heading)] text-lg text-navy">Dein Hund</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="dogName" placeholder="Name des Hundes" className={field} />
          <input name="dogBreed" placeholder="Rasse" className={field} />
          <input name="dogAge" placeholder="Alter" className={field} />
          <textarea name="dogProblems" rows={3} placeholder="Probleme im Alltag / was möchtest du erreichen?" className={`${field} sm:col-span-2`} />
        </div>
      </section>

      <section>
        <h2 className="mb-1 font-[family-name:var(--font-heading)] text-lg text-navy">Impfausweis</h2>
        <p className="mb-3 text-sm text-muted">Bitte ein Foto vom Impfausweis hochladen (wird von Chiara geprüft).</p>
        <input name="vaccination" type="file" accept="image/*" className="text-sm" />
      </section>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Wird gesendet …" : "Registrierung abschließen"}
      </Button>
    </form>
  );
}
