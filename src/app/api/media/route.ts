import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

// Liste der Medien fuer die Bild-Auswahl im CMS.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  const assets = await db.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json({ assets });
}
