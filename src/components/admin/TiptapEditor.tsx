import { useEffect, useRef } from "react";
import { adminInput } from "@/components/admin/AdminLayout";

// Lazy-loaded Tiptap editor — client only
export function TiptapEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;

    Promise.all([
      import("@tiptap/react"),
      import("@tiptap/starter-kit"),
      import("@tiptap/extension-link"),
      import("@tiptap/extension-image"),
    ]).then(([{ Editor }, { default: StarterKit }, { default: Link }, { default: Image }]) => {
      if (destroyed || !containerRef.current) return;

      const editor = new Editor({
        element: containerRef.current,
        extensions: [
          StarterKit,
          Link.configure({ openOnClick: false }),
          Image,
        ],
        content: defaultValue || "",
        onUpdate: ({ editor: e }) => {
          if (hiddenRef.current) hiddenRef.current.value = e.getHTML();
        },
        editorProps: {
          attributes: {
            class: "focus:outline-none min-h-[320px] px-4 py-3 text-base leading-relaxed prose-hunow",
          },
        },
      });

      editorRef.current = editor;
      if (hiddenRef.current) hiddenRef.current.value = editor.getHTML();

      // Simple toolbar
      const toolbar = document.createElement("div");
      toolbar.className = "flex flex-wrap gap-1 px-3 py-2 border-b-2 border-foreground bg-background";

      const btn = (label: string, action: () => void, title?: string) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = label;
        b.title = title ?? label;
        b.className = "px-2 py-1 text-xs font-bold border border-foreground/30 hover:bg-foreground hover:text-background transition-colors";
        b.addEventListener("mousedown", (e) => { e.preventDefault(); action(); });
        return b;
      };

      toolbar.append(
        btn("B", () => editor.chain().focus().toggleBold().run(), "Bold"),
        btn("I", () => editor.chain().focus().toggleItalic().run(), "Italic"),
        btn("H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run()),
        btn("H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run()),
        btn("❝", () => editor.chain().focus().toggleBlockquote().run(), "Blockquote"),
        btn("—", () => editor.chain().focus().setHorizontalRule().run(), "Divider"),
        btn("🔗", () => {
          const url = prompt("URL:");
          if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }, "Add link"),
        btn("🖼", () => {
          const url = prompt("Image URL:");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }, "Add image"),
      );

      containerRef.current.insertBefore(toolbar, containerRef.current.firstChild);
    });

    return () => {
      destroyed = true;
      if (editorRef.current) {
        (editorRef.current as { destroy: () => void }).destroy();
        editorRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <input
        ref={hiddenRef}
        type="hidden"
        name={name}
        defaultValue={defaultValue}
      />
      <div
        ref={containerRef}
        className={`${adminInput} p-0 overflow-hidden`}
      />
    </div>
  );
}
