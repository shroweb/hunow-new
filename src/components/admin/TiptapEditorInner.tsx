// This file is intentionally NOT imported at the top level anywhere —
// it is only ever loaded via React.lazy() in TiptapEditor.tsx so that
// Tiptap (which uses browser APIs) never executes on the server.
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useState } from "react";

interface Props {
  defaultValue?: string;
  onUpdate: (html: string) => void;
}

export default function TiptapEditorInner({ defaultValue, onUpdate }: Props) {
  const [wordCount, setWordCount] = useState(0);

  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false }), Image],
    content: defaultValue || undefined,
    editorProps: {
      handleKeyDown: (_view, event) => {
        if (event.key === "Tab") {
          event.preventDefault();
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
        class: "focus:outline-none min-h-[320px] px-4 py-3 text-base leading-relaxed prose-hunow",
      },
    },
    onCreate: ({ editor: e }) => {
      onUpdate(e.getHTML());
      setWordCount(countWords(e.getText()));
    },
    onUpdate: ({ editor: e }) => {
      onUpdate(e.getHTML());
      setWordCount(countWords(e.getText()));
    },
  });

  const readTime = Math.max(1, Math.round(wordCount / 200));

  const baseClass =
    "px-2 py-1 text-xs font-bold border border-foreground/30 hover:bg-foreground hover:text-background transition-colors";
  const activeClass = "bg-foreground text-background";

  const btn = (label: string, onClick: () => void, title: string, isActive?: boolean) => (
    <button
      key={label}
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`${baseClass}${isActive ? ` ${activeClass}` : ""}`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-1 px-3 py-2 border-b-2 border-foreground bg-background">
        {btn(
          "B",
          () => editor?.chain().focus().toggleBold().run(),
          "Bold",
          editor?.isActive("bold"),
        )}
        {btn(
          "I",
          () => editor?.chain().focus().toggleItalic().run(),
          "Italic",
          editor?.isActive("italic"),
        )}
        {btn(
          "H2",
          () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
          "Heading 2 (applies to current paragraph)",
          editor?.isActive("heading", { level: 2 }),
        )}
        {btn(
          "H3",
          () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
          "Heading 3 (applies to current paragraph)",
          editor?.isActive("heading", { level: 3 }),
        )}
        {btn(
          "❝",
          () => editor?.chain().focus().toggleBlockquote().run(),
          "Blockquote",
          editor?.isActive("blockquote"),
        )}
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

      <EditorContent editor={editor} />

      {/* ③ Word count + read-time */}
      <div className="flex gap-4 px-3 py-1.5 border-t border-foreground/10 text-[10px] font-mono uppercase text-muted-foreground">
        <span>{wordCount} words</span>
        <span>{readTime} min read</span>
      </div>
    </div>
  );
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
