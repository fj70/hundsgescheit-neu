"use client";

import { useActionState } from "react";
import { customerLogin } from "@/app/customer-actions";
import type { FormState } from "@/app/actions";
import { Button } from "@/components/ui/Button";

const initial: FormState = { ok: false };
const field = "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-primary";

export function LoginForm() {
  const [state, action, pending] = useActionState(customerLogin, initial);
  return (
    <form action={action} className="space-y-4">
      <input name="email" type="email" placeholder="E-Mail" required className={field} />
      <input name="password" type="password" placeholder="Passwort" required className={field} />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Anmelden …" : "Anmelden"}
      </Button>
    </form>
  );
}
