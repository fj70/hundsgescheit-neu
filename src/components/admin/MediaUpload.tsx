"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function MediaUpload() {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function upload(files: FileList) {
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      await fetch("/api/upload", { method: "POST", body: fd });
    }
    setUploading(false);
    router.refresh();
  }

  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && upload(e.target.files)}
      />
      <button
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {uploading ? "Lädt hoch …" : "Bilder hochladen"}
      </button>
    </div>
  );
}
