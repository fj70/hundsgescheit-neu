"use client";

import { useState } from "react";
import { SECTION_TYPE_MAP, type FieldDef } from "@/lib/sections";
import { ImagePicker } from "./ImagePicker";
import { RichTextEditor, type Swatch } from "./RichTextEditor";
import { updateSection } from "@/app/admin/actions";

type Data = Record<string, unknown>;

const input = "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-primary";

function FieldInput({
  def,
  value,
  onChange,
  palette,
}: {
  def: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  palette: Swatch[];
}) {
  switch (def.type) {
    case "text":
      return <input className={input} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    case "textarea":
      return <textarea rows={3} className={input} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    case "richtext":
      return <RichTextEditor value={String(value ?? "")} onChange={onChange} palette={palette} />;
    case "image":
      return <ImagePicker value={String(value ?? "")} onChange={onChange} />;
    case "select":
      return (
        <select className={input} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );
    case "list": {
      const items = Array.isArray(value) ? (value as Data[]) : [];
      const update = (i: number, key: string, v: unknown) => {
        const next = items.map((it, idx) => (idx === i ? { ...it, [key]: v } : it));
        onChange(next);
      };
      const add = () => onChange([...items, {}]);
      const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
      const move = (i: number, dir: -1 | 1) => {
        const j = i + dir;
        if (j < 0 || j >= items.length) return;
        const next = [...items];
        [next[i], next[j]] = [next[j], next[i]];
        onChange(next);
      };
      return (
        <div className="space-y-3">
          {items.map((it, i) => (
            <div key={i} className="rounded-lg border bg-soft-2/40 p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-muted">
                <span>#{i + 1}</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => move(i, -1)} className="hover:text-primary">↑</button>
                  <button type="button" onClick={() => move(i, 1)} className="hover:text-primary">↓</button>
                  <button type="button" onClick={() => remove(i)} className="text-red-600">löschen</button>
                </div>
              </div>
              <div className="space-y-2">
                {def.itemFields?.map((f) => (
                  <div key={f.key}>
                    <label className="mb-1 block text-xs text-muted">{f.label}</label>
                    <FieldInput def={f} value={it[f.key]} onChange={(v) => update(i, f.key, v)} palette={palette} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button type="button" onClick={add} className="rounded-lg border border-dashed px-3 py-2 text-sm text-primary">
            + Hinzufügen
          </button>
        </div>
      );
    }
    default:
      return null;
  }
}

export function SectionEditor({
  section,
  palette = [],
}: {
  section: { id: string; pageId: string; type: string; data: string };
  palette?: Swatch[];
}) {
  const def = SECTION_TYPE_MAP[section.type];
  const [data, setData] = useState<Data>(() => {
    try {
      return JSON.parse(section.data || "{}");
    } catch {
      return {};
    }
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!def) return <p className="text-sm text-muted">Unbekannter Abschnittstyp: {section.type}</p>;

  async function save() {
    setSaving(true);
    const fd = new FormData();
    fd.append("id", section.id);
    fd.append("pageId", section.pageId);
    fd.append("data", JSON.stringify(data));
    await updateSection(fd);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4">
      {def.fields.map((f) => (
        <div key={f.key}>
          <label className="mb-1 block text-sm font-medium">{f.label}</label>
          {f.help && <p className="mb-1 text-xs text-muted">{f.help}</p>}
          <FieldInput def={f} value={data[f.key]} onChange={(v) => setData({ ...data, [f.key]: v })} palette={palette} />
        </div>
      ))}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Speichert …" : "Abschnitt speichern"}
        </button>
        {saved && <span className="text-sm text-green-700">Gespeichert ✓</span>}
      </div>
    </div>
  );
}
