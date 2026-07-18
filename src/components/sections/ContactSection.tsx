import { Container } from "@/components/ui/Container";
import { getSettings } from "@/lib/settings";
import { ContactForm } from "./ContactForm";

export async function ContactSection({ heading, text }: { heading: string; text: string }) {
  const settings = await getSettings();
  return (
    <section className="py-16">
      <Container className="grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl text-navy sm:text-4xl">{heading}</h2>
          {text && <p className="mt-4 text-muted">{text}</p>}
          <div className="mt-8 space-y-4 text-sm">
            <div>
              <div className="font-[family-name:var(--font-heading)] text-primary">Wo bin ich zu finden?</div>
              <p className="text-muted">{settings.city || "Essen"} und Umgebung</p>
            </div>
            <div>
              <div className="font-[family-name:var(--font-heading)] text-primary">E-Mail</div>
              <a href={`mailto:${settings.email}`} className="text-secondary underline">{settings.email}</a>
            </div>
            {settings.phone && (
              <div>
                <div className="font-[family-name:var(--font-heading)] text-primary">Telefon</div>
                <a href={`tel:${settings.phone}`} className="text-secondary underline">{settings.phone}</a>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-[20px] border bg-soft p-6 sm:p-8">
          <ContactForm subjects={["Einzelcoaching", "Gruppencoaching", "Onlinecoaching", "Social Walk"]} />
        </div>
      </Container>
    </section>
  );
}
