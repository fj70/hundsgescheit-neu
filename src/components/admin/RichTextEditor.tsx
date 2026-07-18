"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { useEffect } from "react";

export type Swatch = { name: string; color: string };

// Standard-Farbvorschläge (Schwarz/Weiß/Grau) + die Hauptfarben der Seite werden ergänzt.
const BASE_SWATCHES: Swatch[] = [
  { name: "Text", color: "#14202a" },
  { name: "Grau", color: "#7e7e7e" },
  { name: "Weiß", color: "#ffffff" },
];

function Btn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`h-8 min-w-8 rounded px-2 text-sm ${active ? "bg-primary text-white" : "hover:bg-soft-2"}`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  palette = [],
}: {
  value: string;
  onChange: (html: string) => void;
  palette?: Swatch[];
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class: "prose-hg min-h-40 rounded-b-lg border border-t-0 bg-white px-4 py-3 outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Externe Wertänderung (z. B. Reset) übernehmen
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const swatches = [...palette, ...BASE_SWATCHES];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border bg-soft-2/40 p-1.5">
        <Btn title="Überschrift groß" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Btn>
        <Btn title="Überschrift klein" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Btn>
        <span className="mx-1 h-5 w-px bg-border" />
        <Btn title="Fett" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><b>F</b></Btn>
        <Btn title="Kursiv" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><i>K</i></Btn>
        <Btn title="Liste" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>• Liste</Btn>
        <span className="mx-1 h-5 w-px bg-border" />
        <span className="text-xs text-muted">Farbe:</span>
        {swatches.map((s) => (
          <button
            key={s.color + s.name}
            type="button"
            title={s.name}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setColor(s.color).run()}
            className="h-6 w-6 rounded-full border shadow-sm"
            style={{ backgroundColor: s.color }}
          />
        ))}
        <Btn title="Farbe zurücksetzen" onClick={() => editor.chain().focus().unsetColor().run()}>✕</Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
