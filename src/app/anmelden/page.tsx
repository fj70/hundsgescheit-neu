import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getCustomerSession } from "@/lib/customer-auth";
import { LoginForm } from "@/components/customer/LoginForm";

export const metadata = { title: "Anmelden", robots: { index: false } };

export default async function AnmeldenPage() {
  if (await getCustomerSession()) redirect("/mein-bereich");
  return (
    <section className="py-16">
      <Container className="max-w-md">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl text-primary">Stammkunden-Login</h1>
        <p className="mt-2 text-sm text-muted">
          Für bereits freigeschaltete Kund:innen. Noch keinen Zugang? Der erste Kontakt läuft über das{" "}
          <a href="/kontakt" className="text-primary underline">Kontaktformular</a> – den Zugang
          bekommst du von Chiara.
        </p>
        <div className="mt-8 rounded-[20px] border bg-white p-6 sm:p-8">
          <LoginForm />
        </div>
      </Container>
    </section>
  );
}
