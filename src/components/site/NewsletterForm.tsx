"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type FormState } from "@/app/actions";

const initial: FormState = { ok: false };

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeNewsletter, initial);

  if (state.ok) {
    return <p className="text-sm text-navy">Danke! Du bist eingetragen.</p>;
  }

  return (
    <form action={action} className="space-y-2">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      <input
        name="email"
        type="email"
        placeholder="Deine Email"
        required
        className="w-full rounded-full border border-navy/20 bg-white/70 px-5 py-3 text-sm outline-none focus:border-navy"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full border-2 border-navy px-5 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white disabled:opacity-60"
      >
        {pending ? "Wird gesendet …" : "Abschicken"}
      </button>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
