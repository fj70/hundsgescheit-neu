"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Schlichter DSGVO-Hinweis. Die Seite setzt aktuell nur technisch notwendige Cookies
// (Login-Session) und lädt kein Tracking. Wird später Analytics ergänzt, muss dieser
// Banner auf echte Einwilligung (Opt-in) umgestellt werden.
export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("hg_cookie_ok")) setShow(true);
    } catch {
      /* localStorage nicht verfügbar */
    }
  }, []);

  if (!show) return null;

  function accept() {
    try {
      localStorage.setItem("hg_cookie_ok", "1");
    } catch {}
    setShow(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 rounded-[18px] border bg-white p-4 shadow-xl sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-muted">
          Diese Website verwendet nur technisch notwendige Cookies (z. B. für den Login-Bereich)
          und lädt kein Tracking. Mehr dazu in der{" "}
          <Link href="/datenschutz" className="text-primary underline">Datenschutzerklärung</Link>.
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Verstanden
        </button>
      </div>
    </div>
  );
}
