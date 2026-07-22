import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata = { title: "Seite nicht gefunden" };

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center bg-soft py-20">
      <Container className="max-w-xl text-center">
        <p className="font-[family-name:var(--font-hand)] text-2xl text-secondary">Hoppla!</p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-5xl text-primary">404</h1>
        <p className="mt-4 text-lg text-muted">
          Diese Seite hat sich wohl von der Leine gerissen. Sie ist nicht (mehr) da.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark">Zur Startseite</Link>
          <Link href="/kontakt" className="rounded-full border-2 border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white">Kontakt aufnehmen</Link>
        </div>
      </Container>
    </section>
  );
}
