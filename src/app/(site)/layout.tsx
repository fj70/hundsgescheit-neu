import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSettings, colorCssVars } from "@/lib/settings";
import { getNav } from "@/lib/nav";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, nav] = await Promise.all([getSettings(), getNav()]);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: colorCssVars(settings) }} />
      <LocalBusinessJsonLd settings={settings} />
      <Header nav={nav} siteName={settings.siteName} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
