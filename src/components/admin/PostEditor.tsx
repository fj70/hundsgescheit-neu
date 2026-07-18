"use client";

import { useState } from "react";
import { ImagePicker } from "./ImagePicker";
import { updatePost, deletePost } from "@/app/admin/actions";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  coverImagePath: string | null;
  coverImageAlt: string;
  metaTitle: string | null;
  metaDescription: string | null;
  status: string;
};

const input = "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-primary";

export function PostEditor({ post }: { post: Post }) {
  const [cover, setCover] = useState(post.coverImagePath ?? "");
  const [status, setStatus] = useState(post.status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(publish: boolean, form: HTMLFormElement) {
    setSaving(true);
    const fd = new FormData(form);
    fd.set("id", post.id);
    fd.set("coverImagePath", cover);
    fd.set("status", publish ? "PUBLISHED" : "DRAFT");
    await updatePost(fd);
    setStatus(publish ? "PUBLISHED" : "DRAFT");
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <div>
        <label className="mb-1 block text-sm font-medium">Titel</label>
        <input name="title" defaultValue={post.title} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Kurzbeschreibung (Vorschau)</label>
        <textarea name="excerpt" rows={2} defaultValue={post.excerpt} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Beitragsbild</label>
        <ImagePicker value={cover} onChange={setCover} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Bildbeschreibung (Alt)</label>
        <input name="coverImageAlt" defaultValue={post.coverImageAlt} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Inhalt</label>
        <p className="mb-1 text-xs text-muted">Einfaches HTML: &lt;h2&gt;Überschrift&lt;/h2&gt;, &lt;p&gt;Absatz&lt;/p&gt;, &lt;ul&gt;&lt;li&gt;Liste&lt;/li&gt;&lt;/ul&gt;</p>
        <textarea name="contentHtml" rows={16} defaultValue={post.contentHtml} className={`${input} font-mono text-xs`} />
      </div>
      <details className="rounded-lg border bg-soft-2/40 p-4">
        <summary className="cursor-pointer text-sm font-medium">SEO (optional)</summary>
        <div className="mt-3 space-y-3">
          <input name="metaTitle" defaultValue={post.metaTitle ?? ""} placeholder="SEO-Titel" className={input} />
          <textarea name="metaDescription" rows={2} defaultValue={post.metaDescription ?? ""} placeholder="SEO-Beschreibung" className={input} />
        </div>
      </details>

      <div className="flex flex-wrap items-center gap-3 border-t pt-5">
        <button
          type="button"
          disabled={saving}
          onClick={(e) => save(true, e.currentTarget.closest("form")!)}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {status === "PUBLISHED" ? "Aktualisieren & veröffentlicht lassen" : "Veröffentlichen"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={(e) => save(false, e.currentTarget.closest("form")!)}
          className="rounded-lg border px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          Als Entwurf speichern
        </button>
        {saved && <span className="text-sm text-green-700">Gespeichert ✓</span>}
        <span className="ml-auto text-xs text-muted">
          Status: {status === "PUBLISHED" ? "öffentlich" : "Entwurf"}
        </span>
      </div>

      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => {
            const fd = new FormData();
            fd.set("id", post.id);
            if (confirm("Diesen Beitrag wirklich löschen?")) deletePost(fd);
          }}
          className="text-sm text-red-600 hover:underline"
        >
          Beitrag löschen
        </button>
      </div>
    </form>
  );
}
