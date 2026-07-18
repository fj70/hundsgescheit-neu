import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

// Bild-Upload fuers CMS. Speichert nach public/uploads/cms und legt einen MediaAsset an.
// In Produktion (Docker/Coolify) sollte public/uploads als Volume gemountet sein.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Keine Datei" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Nur Bilder erlaubt" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "bild";
  const stamp = bytes.length.toString(36); // deterministischer Suffix ohne Date.now
  const filename = `${base}-${stamp}.${ext}`;

  const dir = join(process.cwd(), "public", "uploads", "cms");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), bytes);

  const path = `/uploads/cms/${filename}`;
  const asset = await db.mediaAsset.create({
    data: {
      filename,
      path,
      alt: "",
      title: file.name,
      mimeType: file.type,
      size: bytes.length,
    },
  });

  return NextResponse.json({ ok: true, path, id: asset.id });
}
