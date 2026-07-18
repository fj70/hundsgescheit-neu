"use client";

import { useState, useRef, useEffect } from "react";

type Asset = { id: string; path: string; title: string };

// Bildauswahl: aktuelles Bild anzeigen, hochladen oder aus der Bibliothek wählen.
export function ImagePicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (path: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [libOpen, setLibOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (libOpen && assets.length === 0) {
      fetch("/api/media")
        .then((r) => r.json())
        .then((d) => setAssets(d.assets || []))
        .catch(() => {});
    }
  }, [libOpen, assets.length]);

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.path) onChange(data.path);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {label && <label className="mb-1 block text-sm font-medium">{label}</label>}
      <div className="flex items-start gap-3">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border bg-soft-2">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">kein Bild</div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            {uploading ? "Lädt …" : "Bild hochladen"}
          </button>
          <button
            type="button"
            onClick={() => setLibOpen((v) => !v)}
            className="rounded-lg border px-3 py-1.5 text-xs"
          >
            Aus Bibliothek
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="text-xs text-red-600">
              Entfernen
            </button>
          )}
        </div>
      </div>

      {libOpen && (
        <div className="mt-3 grid max-h-56 grid-cols-4 gap-2 overflow-y-auto rounded-lg border bg-white p-2 sm:grid-cols-6">
          {assets.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                onChange(a.path);
                setLibOpen(false);
              }}
              className="relative aspect-square overflow-hidden rounded border hover:ring-2 hover:ring-primary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.path} alt={a.title} className="h-full w-full object-cover" />
            </button>
          ))}
          {assets.length === 0 && <p className="col-span-full p-2 text-xs text-muted">Noch keine Medien.</p>}
        </div>
      )}
    </div>
  );
}
