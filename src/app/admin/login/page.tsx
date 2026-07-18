import { redirect } from "next/navigation";
import { login, getSession } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Login" };

async function doLogin(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const user = await login(email, password);
  if (user) redirect("/admin");
  redirect("/admin/login?error=1");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (await getSession()) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft px-4">
      <div className="w-full max-w-sm rounded-[20px] border bg-white p-8 shadow-sm">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl text-primary">Anmelden</h1>
        <p className="mt-1 text-sm text-muted">Verwaltung von hundsgescheit.de</p>
        <form action={doLogin} className="mt-6 space-y-4">
          <input
            name="email"
            type="email"
            placeholder="E-Mail"
            required
            className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <input
            name="password"
            type="password"
            placeholder="Passwort"
            required
            className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-primary"
          />
          {error && <p className="text-sm text-red-600">E-Mail oder Passwort falsch.</p>}
          <Button type="submit" className="w-full">Einloggen</Button>
        </form>
      </div>
    </div>
  );
}
