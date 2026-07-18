import type { Metadata } from "next";
import { PageView, getPageMeta } from "@/components/site/PageView";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getPageMeta("home");
  return { title: meta?.title, description: meta?.description };
}

export default function HomePage() {
  return <PageView slug="home" />;
}
