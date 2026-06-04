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

      // Toolbar is created first so updateToolbar can reference it
      const toolbar = document.createElement("div");
      toolbar.className = "flex flex-wrap gap-1 px-3 py-2 border-b-2 border-foreground bg-background";

      const activeClass = "bg-foreground text-background";
      const baseClass = "px-2 py-1 text-xs font-bold border border-foreground/30 hover:bg-foreground hover:text-background transition-colors";

      const updateToolbar = (e: { isActive: (name: string, attrs?: object) => boolean }) => {
        toolbar.querySelectorAll<HTMLButtonElement>("button[data-active]").forEach((b) => {
          const fn = (b as HTMLButtonElement & { _isActive?: () => boolean })._isActive;
          if (fn) {
            const active = fn();
            b.dataset.active = String(active);
            b.className = active ? `${baseClass} ${activeClass}` : baseClass;
          }
        });
      };

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
          updateToolbar(e);
        },
        onSelectionUpdate: ({ editor: e }) => {
          updateToolbar(e);
        },
        editorProps: {
          handleKeyDown: (_view, event) => {
            if (event.key === "Tab") {
              // Let Tiptap's ListItem extension handle Tab inside lists;
              // outside lists, just swallow it so focus doesn't leave the editor.
              const { $from } = _view.state.selection;
              let inList = false;
              for (let d = $from.depth; d >= 0; d--) {
                if (_view.state.doc.resolve($from.before(d + 1)).parent.type.name === "listItem") {
                  inList = true;
                  break;
                }
              }
              if (!inList) {
                event.preventDefault();
                return true;
              }
            }
            return false;
          },
          attributes: {
            class: "focus:outline-none min-h-[320px] px-4 py-3 text-base leading-relaxed prose-hunow",
          },
        },
      });

      editorRef.current = editor;
      if (hiddenRef.current) hiddenRef.current.value = editor.getHTML();

      const btn = (label: string, action: () => void, title?: string, isActive?: () => boolean) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = label;
        b.title = title ?? label;
        b.className = baseClass;
        b.dataset.active = "false";
        b.addEventListener("mousedown", (e) => { e.preventDefault(); action(); });
        if (isActive) (b as HTMLButtonElement & { _isActive: () => boolean })._isActive = isActive;
        return b;
      };

      toolbar.append(
        btn("B", () => editor.chain().focus().toggleBold().run(), "Bold", () => editor.isActive("bold")),
        btn("I", () => editor.chain().focus().toggleItalic().run(), "Italic", () => editor.isActive("italic")),
        btn("H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "Heading 2 (applies to current paragraph)", () => editor.isActive("heading", { level: 2 })),
        btn("H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "Heading 3 (applies to current paragraph)", () => editor.isActive("heading", { level: 3 })),
        btn("❝", () => editor.chain().focus().toggleBlockquote().run(), "Blockquote", () => editor.isActive("blockquote")),
        btn("—", () => editor.chain().focus().setHorizontalRule().run(), "Divider"),
        btn("🔗", () => {
          const url = prompt("URL:");
          if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }, "Add link", () => editor.isActive("link")),
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
