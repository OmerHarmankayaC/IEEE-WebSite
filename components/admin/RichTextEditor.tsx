"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { useEffect, useRef, useState } from "react";
import { uploadImage } from "@/lib/upload";

type Props = {
  initialHtml: string;
  placeholder: string;
  lang: "tr" | "en";
  onChange: (html: string) => void;
  onReady?: (editor: Editor) => void;
};

function ToolButton({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="tool" aria-label={label} title={label} aria-pressed={active} onClick={onClick}>
      {children}
    </button>
  );
}

export function RichTextEditor({ initialHtml, placeholder, lang, onChange, onReady }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const insertRef = useRef<(files: File[], pos?: number) => void>(() => {});

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: { class: "editor__content prose", lang, "aria-label": placeholder },
      handleDrop: (view, event, _slice, moved) => {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((file) => file.type.startsWith("image/"));
        if (moved || files.length === 0) return false;
        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        insertRef.current(files, pos);
        return true;
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((file) => file.type.startsWith("image/"));
        if (files.length === 0) return false;
        event.preventDefault();
        insertRef.current(files);
        return true;
      },
    },
    onCreate: ({ editor }) => onReady?.(editor),
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Uploads images and inserts them at the drop position, or at the cursor.
  useEffect(() => {
    insertRef.current = async (files: File[], pos?: number) => {
      if (!editor) return;
      setError(null);
      setUploading(true);
      try {
        for (const file of files) {
          const { url } = await uploadImage(file, "posts");
          const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
          const chain = editor.chain().focus();
          (pos !== undefined ? chain.insertContentAt(pos, { type: "image", attrs: { src: url, alt } }) : chain.setImage({ src: url, alt })).run();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Görsel yüklenemedi.");
      } finally {
        setUploading(false);
      }
    };
  }, [editor]);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            h2: e.isActive("heading", { level: 2 }),
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            link: e.isActive("link"),
            image: e.isActive("image"),
            imageAlt: (e.getAttributes("image").alt as string | undefined) ?? "",
          }
        : null,
  });

  const openLink = () => {
    setLinkUrl((editor?.getAttributes("link").href as string | undefined) ?? "");
    setLinkOpen((value) => !value);
  };

  const applyLink = () => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: /^(https?:|mailto:)/.test(url) ? url : `https://${url}` }).run();
    setLinkOpen(false);
  };

  return (
    <div className="editor">
      <div className="editor__toolbar" role="toolbar" aria-label="Metin biçimlendirme">
        <ToolButton label="Ara başlık" active={state?.h2} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          <span className="tool__text">H2</span>
        </ToolButton>
        <ToolButton label="Kalın" active={state?.bold} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <span style={{ fontWeight: 700 }}>B</span>
        </ToolButton>
        <ToolButton label="İtalik" active={state?.italic} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>I</span>
        </ToolButton>
        <span className="editor__sep" aria-hidden="true" />
        <ToolButton label="Madde işaretli liste" active={state?.bullet} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 4h8M6 8h8M6 12h8" stroke="currentColor" strokeWidth="1.3" />
            <rect x="2" y="3.25" width="1.5" height="1.5" fill="currentColor" />
            <rect x="2" y="7.25" width="1.5" height="1.5" fill="currentColor" />
            <rect x="2" y="11.25" width="1.5" height="1.5" fill="currentColor" />
          </svg>
        </ToolButton>
        <ToolButton label="Numaralı liste" active={state?.ordered} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <span className="tool__text">1.</span>
        </ToolButton>
        <ToolButton label="Alıntı" active={state?.quote} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3v10M6.5 5h7M6.5 8h7M6.5 11h5" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </ToolButton>
        <span className="editor__sep" aria-hidden="true" />
        <ToolButton label="Bağlantı" active={state?.link || linkOpen} onClick={openLink}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M6.5 9.5l3-3M7 4.5l1.2-1.2a2.6 2.6 0 0 1 3.6 3.6L10.5 8M9 11.5l-1.2 1.2a2.6 2.6 0 0 1-3.6-3.6L5.5 8"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
        </ToolButton>
        <ToolButton label="Görsel ekle" onClick={() => fileInput.current?.click()}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2" y="3" width="12" height="10" stroke="currentColor" strokeWidth="1.3" />
            <path d="M2.5 11.5l3.5-3.5 3 3 2-2 2.5 2.5" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="10.5" cy="6" r="1" fill="currentColor" />
          </svg>
        </ToolButton>
      </div>

      {linkOpen && (
        <div className="editor__subbar">
          <label className="visually-hidden" htmlFor={`link-${lang}`}>
            Bağlantı adresi
          </label>
          <input
            id={`link-${lang}`}
            className="input"
            type="url"
            placeholder="https://"
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyLink();
              }
            }}
            autoFocus
          />
          <button type="button" className="btn btn--outline btn--small" onClick={applyLink}>
            {linkUrl.trim() ? "Uygula" : "Bağlantıyı kaldır"}
          </button>
        </div>
      )}

      {state?.image && (
        <div className="editor__subbar">
          <label htmlFor={`alt-${lang}`} className="mono mono--muted" style={{ whiteSpace: "nowrap" }}>
            Görsel açıklaması
          </label>
          <input
            id={`alt-${lang}`}
            className="input"
            type="text"
            placeholder="Görselde ne var? Ekran okuyucular bunu okur."
            value={state.imageAlt}
            onChange={(event) => editor?.chain().updateAttributes("image", { alt: event.target.value }).run()}
          />
        </div>
      )}

      <EditorContent editor={editor} />

      <div
        className="dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const files = Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
          if (files.length) insertRef.current(files);
        }}
      >
        {uploading ? (
          <span className="mono">Görsel yükleniyor…</span>
        ) : (
          <>
            <span style={{ fontWeight: 400 }}>Görseli buraya sürükle ya da</span>
            <button type="button" className="btn btn--outline btn--small" onClick={() => fileInput.current?.click()}>
              Bilgisayarından seç
            </button>
            <span className="mono mono--muted">JPG, PNG ve WEBP yüklenirken otomatik küçültülür.</span>
          </>
        )}
        {error && (
          <span className="notice notice--error" role="alert">
            {error}
          </span>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            if (files.length) insertRef.current(files);
          }}
        />
      </div>
    </div>
  );
}
