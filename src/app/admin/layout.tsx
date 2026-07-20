import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, logout } from "@/lib/auth";

export const metadata = { title: "Verwaltung", robots: { index: false } };

const NAV = [
  { href: "/admin", label: "Übersicht", exact: true },
  { href: "/admin/termine", label: "Termine & Buchungen" },
  { href: "/admin/kunden", label: "Stammkunden" },
  { href: "/admin/kurse", label: "Kurse" },
  { href: "/admin/seiten", label: "Seiten" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/medien", label: "Medien" },
  { href: "/admin/anfragen", label: "Anfragen" },
  { href: "/admin/einstellungen", label: "Einstellungen" },
];

async function doLogout() {
  "use server";
  await logout();
  redirect("/admin/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  // Login-Seite hat kein Chrome; sie liegt unter /admin/login und rendert ueber dieses Layout.
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-soft">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-white p-5 lg:flex">
        <Link href="/admin" className="font-[family-name:var(--font-heading)] text-lg text-primary">
          Hundsgescheit
        </Link>
        <p className="mb-6 text-xs text-muted">Verwaltung</p>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-2 text-sm text-foreground hover:bg-soft-2 hover:text-primary"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t pt-4 text-xs text-muted">
          <div className="mb-2">{session.name}</div>
          <Link href="/" className="block hover:text-primary">↗ Website ansehen</Link>
          <form action={doLogout}>
            <button className="mt-1 text-left hover:text-primary">Abmelden</button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        {/* Mobile-Topbar */}
        <div className="flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
          <Link href="/admin" className="font-[family-name:var(--font-heading)] text-primary">Hundsgescheit</Link>
          <form action={doLogout}><button className="text-sm text-muted">Abmelden</button></form>
        </div>
        <div className="mx-auto max-w-5xl p-5 sm:p-8">{children}</div>
        {/* Mobile-Navigation */}
        <nav className="flex flex-wrap gap-2 border-t bg-white p-3 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-lg bg-soft-2 px-3 py-1.5 text-xs">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
