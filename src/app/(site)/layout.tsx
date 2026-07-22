import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSettings, colorCssVars } from "@/lib/settings";
import { getNav } from "@/lib/nav";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";
import { CookieBanner } from "@/components/site/CookieBanner";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, nav] = await Promise.all([getSettings(), getNav()]);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: colorCssVars(settings) }} />
      <LocalBusinessJsonLd settings={settings} />
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Zum Inhalt springen
      </a>
      <Header nav={nav} siteName={settings.siteName} />
      <main id="inhalt" className="flex-1">{children}</main>
      <Footer settings={settings} />
      <CookieBanner />
    </>
  );
}
