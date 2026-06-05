// This file is intentionally NOT imported at the top level anywhere —
// it is only ever loaded via React.lazy() in TiptapEditor.tsx so that
// Tiptap (which uses browser APIs) never executes on the server.
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

interface Props {
  defaultValue?: string;
  onUpdate: (html: string) => void;
}

export default function TiptapEditorInner({ defaultValue, onUpdate }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: defaultValue || undefined,
    editorProps: {
      handleKeyDown: (_view, event) => {
        if (event.key === "Tab") {
          event.preventDefault();
          // Delegate to list-item indent/outdent; no-op outside lists
          if (event.shiftKey) {
            editor?.chain().focus().liftListItem("listItem").run();
          } else {
            editor?.chain().focus().sinkListItem("listItem").run();
          }
          return true;
        }
        return false;
      },
      attributes: {
        class:
          "focus:outline-none min-h-[320px] px-4 py-3 text-base leading-relaxed prose-hunow",
      },
    },
    // onCreate fires after the editor is fully initialised (schema ready)
    onCreate: ({ editor: e }) => onUpdate(e.getHTML()),
    onUpdate: ({ editor: e }) => onUpdate(e.getHTML()),
  });

  // Toolbar button helpers
  const baseClass =
    "px-2 py-1 text-xs font-bold border border-foreground/30 hover:bg-foreground hover:text-background transition-colors";
  const activeClass = "bg-foreground text-background";

  const btn = (
    label: string,
    onClick: () => void,
    title: string,
    isActive?: boolean,
  ) => (
    <button
      key={label}
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); // keep selection
        onClick();
      }}
      className={`${baseClass}${isActive ? ` ${activeClass}` : ""}`}
    >
      {label}
    </button>
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 px-3 py-2 border-b-2 border-foreground bg-background">
        {btn("B", () => editor?.chain().focus().toggleBold().run(), "Bold", editor?.isActive("bold"))}
        {btn("I", () => editor?.chain().focus().toggleItalic().run(), "Italic", editor?.isActive("italic"))}
        {btn("H2", () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), "Heading 2 (applies to current paragraph)", editor?.isActive("heading", { level: 2 }))}
        {btn("H3", () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), "Heading 3 (applies to current paragraph)", editor?.isActive("heading", { level: 3 }))}
        {btn("❝", () => editor?.chain().focus().toggleBlockquote().run(), "Blockquote", editor?.isActive("blockquote"))}
        {btn("—", () => editor?.chain().focus().setHorizontalRule().run(), "Divider")}
        {btn(
          "🔗",
          () => {
            const url = prompt("URL:");
            if (url) editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          },
          "Add link",
          editor?.isActive("link"),
        )}
        {btn(
          "🖼",
          () => {
            const url = prompt("Image URL:");
            if (url) editor?.chain().focus().setImage({ src: url }).run();
          },
          "Add image",
        )}
      </div>

      {/* The Tiptap v3 EditorContent — this is what actually initialises the editor view */}
      <EditorContent editor={editor} />
    </div>
  );
}
