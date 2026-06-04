import { type ReactNode, useState } from "react";
import { subscribeNewsletter } from "@/lib/public.functions";

interface Block {
  type: "p" | "h2" | "h3" | "blockquote" | "image" | "divider";
  text?: string;
  src?: string;
  alt?: string;
  id?: string;
}

function slugId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function applyInline(text: string) {
  // Bold, italic, links
  const parts: (string | ReactNode)[] = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2]) parts.push(<strong key={key++}>{m[2]}</strong>);
    else if (m[3]) parts.push(<em key={key++}>{m[3]}</em>);
    else if (m[4] && m[5])
      parts.push(
        <a key={key++} href={m[5]} target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">
          {m[4]}
        </a>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function parseContent(raw: string): Block[] {
  const lines = raw.split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }
    if (line.startsWith("## ")) {
      const text = line.slice(3);
      blocks.push({ type: "h2", text, id: slugId(text) });
    } else if (line.startsWith("### ")) {
      const text = line.slice(4);
      blocks.push({ type: "h3", text, id: slugId(text) });
    } else if (line.startsWith("> ")) {
      blocks.push({ type: "blockquote", text: line.slice(2) });
    } else if (line.startsWith("---")) {
      blocks.push({ type: "divider" });
    } else if (line.match(/^!\[(.*)]\((.+)\)$/)) {
      const m = line.match(/^!\[(.*?)]\((.+?)\)$/)!;
      blocks.push({ type: "image", alt: m[1], src: m[2] });
    } else {
      // Accumulate paragraph lines
      const para: string[] = [line];
      while (i + 1 < lines.length && lines[i + 1].trim() && !lines[i + 1].startsWith("#") && !lines[i + 1].startsWith(">") && !lines[i + 1].startsWith("---") && !lines[i + 1].match(/^!\[/)) {
        i++;
        para.push(lines[i].trim());
      }
      blocks.push({ type: "p", text: para.join(" ") });
    }
    i++;
  }
  return blocks;
}

export function TableOfContents({ content }: { content: string }) {
  const headings = parseContent(content).filter((b) => b.type === "h2" || b.type === "h3");
  if (headings.length < 2) return null;
  return (
    <nav className="border-2 border-foreground bg-white p-5 mb-10" aria-label="Table of contents">
      <div className="text-[10px] font-mono uppercase font-bold tracking-widest mb-3">
        In this article
      </div>
      <ol className="space-y-1.5">
        {headings.map((h, i) => (
          <li key={i} className={h.type === "h3" ? "pl-4" : ""}>
            <a
              href={`#${h.id}`}
              className="text-sm hover:text-accent hover:underline text-muted-foreground"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function InlineNewsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  if (done) {
    return (
      <div className="my-10 border-2 border-accent bg-accent/5 px-6 py-5 text-center">
        <p className="font-bold text-sm">Thanks — see you Thursday.</p>
      </div>
    );
  }
  return (
    <aside className="my-10 border-2 border-foreground bg-foreground text-background px-6 py-8">
      <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
        HU NOW Newsletter
      </div>
      <p className="font-display text-2xl uppercase leading-tight mb-1">
        Get Hull in your inbox
      </p>
      <p className="text-sm text-background/70 mb-4">
        The best events, food guides and hidden gems every Thursday.
      </p>
      <form
        className="flex gap-0"
        onSubmit={(e) => {
          e.preventDefault();
          if (email) {
            void subscribeNewsletter({ data: { email } }).catch(() => {});
            setDone(true);
          }
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 bg-background text-foreground border-2 border-background px-4 py-3 font-mono text-sm focus:outline-none"
        />
        <button className="bg-accent text-foreground px-5 py-3 font-bold uppercase tracking-widest text-xs hover:bg-background transition-colors">
          Join
        </button>
      </form>
    </aside>
  );
}

/** Renders HTML content from the Tiptap editor */
export function ArticleHtml({ content }: { content: string }) {
  return (
    <div
      className="prose-hunow"
      // Content is admin-authored only — safe to render
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

/** Auto-detects HTML vs legacy markdown */
export function ArticleContent({ content }: { content: string }) {
  if (content.trimStart().startsWith("<")) return <ArticleHtml content={content} />;
  return <ArticleContentLegacy content={content} />;
}

function ArticleContentLegacy({ content }: { content: string }) {
  const blocks = parseContent(content);
  let pCount = 0;
  return (
    <div className="text-lg leading-relaxed">
      {blocks.map((block, i) => {
        if (block.type === "h2")
          return (
            <h2 key={i} id={block.id} className="text-3xl font-bold mt-12 mb-4 leading-tight scroll-mt-24">
              {block.text}
            </h2>
          );
        if (block.type === "h3")
          return (
            <h3 key={i} id={block.id} className="text-xl font-bold mt-8 mb-3 leading-tight scroll-mt-24">
              {block.text}
            </h3>
          );
        if (block.type === "blockquote")
          return (
            <blockquote key={i} className="my-8 pl-6 border-l-4 border-accent text-xl italic text-muted-foreground">
              {block.text}
            </blockquote>
          );
        if (block.type === "image")
          return (
            <figure key={i} className="my-8">
              <img src={block.src} alt={block.alt} className="w-full" loading="lazy" />
              {block.alt && <figcaption className="mt-2 text-xs font-mono text-muted-foreground">{block.alt}</figcaption>}
            </figure>
          );
        if (block.type === "divider")
          return <hr key={i} className="my-10 border-foreground/20" />;
        // Paragraph
        pCount++;
        const node = <p key={i} className="mb-6">{applyInline(block.text ?? "")}</p>;
        if (pCount === 3) {
          return (
            <div key={i}>
              {node}
              <InlineNewsletter />
            </div>
          );
        }
        return node;
      })}
    </div>
  );
}
