import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";
import { RegistrationForm } from "@/components/customer/RegistrationForm";

export const metadata = { title: "Registrierung", robots: { index: false } };

export default async function RegistrierenPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const customer = token ? await db.customer.findUnique({ where: { inviteToken: token } }) : null;

  return (
    <section className="py-14">
      <Container className="max-w-2xl">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl text-primary">Willkommen im Stammkunden-Bereich</h1>
        {!customer ? (
          <div className="mt-6 rounded-[20px] border bg-soft p-8">
            <p className="text-muted">
              Dieser Registrierungs-Link ist ungültig oder wurde bereits verwendet. Den Zugang
              erhältst du von Chiara nach dem ersten Training. Erstkontakt bitte über das{" "}
              <a href="/kontakt" className="text-primary underline">Kontaktformular</a>.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-2 text-muted">
              Bitte einmalig deine Angaben ergänzen. Danach kannst du Kurse selbst buchen.
            </p>
            <div className="mt-8 rounded-[20px] border bg-white p-6 sm:p-8">
              <RegistrationForm token={token!} email={customer.email} />
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
