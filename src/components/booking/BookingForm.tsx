"use client";

import { useActionState, useState } from "react";
import { createBooking, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/Button";

const initial: FormState = { ok: false };
const field = "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-primary";

export type SessionOption = {
  id: string;
  label: string;
  free: number;
};

export function BookingForm({ sessions }: { sessions: SessionOption[] }) {
  const [state, action, pending] = useActionState(createBooking, initial);
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? "");

  if (state.ok) {
    return (
      <div className="rounded-[20px] border border-primary/30 bg-soft p-8 text-center">
        <h3 className="font-[family-name:var(--font-heading)] text-xl text-primary">Buchungsanfrage gesendet!</h3>
        <p className="mt-2 text-muted">
          Deine Anfrage ist eingegangen. Chiara bestätigt deinen Platz und meldet sich bei dir.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Termin wählen</label>
        <select name="sessionId" className={field} value={sessionId} onChange={(e) => setSessionId(e.target.value)} required>
          {sessions.map((s) => (
            <option key={s.id} value={s.id} disabled={s.free <= 0}>
              {s.label} {s.free <= 0 ? "(ausgebucht)" : `– ${s.free} Plätze frei`}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <input name="customerName" placeholder="Dein Name" className={field} />
          {state.fieldErrors?.customerName && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.customerName}</p>}
        </div>
        <div>
          <input name="customerEmail" type="email" placeholder="Deine E-Mail" className={field} />
          {state.fieldErrors?.customerEmail && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.customerEmail}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="customerPhone" placeholder="Telefon (optional)" className={field} />
        <input name="dogName" placeholder="Name deines Hundes" className={field} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Anzahl Teilnehmer</label>
          <input name="people" type="number" min={1} max={10} defaultValue={1} className={field} />
        </div>
      </div>
      <textarea name="notes" rows={3} placeholder="Anmerkungen (optional)" className={field} />
      <label className="flex items-start gap-2 text-sm text-muted">
        <input type="checkbox" name="agb" value="1" className="mt-1" />
        <span>Ich akzeptiere die <a href="/agb" className="text-primary underline">AGB</a> und <a href="/datenschutz" className="text-primary underline">Datenschutzerklärung</a>.</span>
      </label>
      {state.fieldErrors?.agb && <p className="text-xs text-red-600">{state.fieldErrors.agb}</p>}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Wird gesendet …" : "Verbindlich anfragen"}
      </Button>
    </form>
  );
}
