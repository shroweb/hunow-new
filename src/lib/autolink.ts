export interface Entity {
  name: string;
  path: string;
}

export function autoLink(html: string, entities: Entity[]): string {
  if (!html || entities.length === 0) return html;

  // Longest match first to avoid partial replacements
  const sorted = [...entities].sort((a, b) => b.name.length - a.name.length);
  const linked = new Set<string>();
  let result = html;

  for (const { name, path } of sorted) {
    if (linked.has(path)) continue;

    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Split on HTML tags; only process text nodes
    const parts = result.split(/(<[^>]+>)/);
    let found = false;

    const processed = parts.map((part) => {
      if (found || part.startsWith("<")) return part;
      const replaced = part.replace(new RegExp(`\\b${escaped}\\b`, "i"), (match) => {
        found = true;
        return `<a href="${path}" class="underline hover:text-accent transition-colors">${match}</a>`;
      });
      return replaced;
    });

    if (found) {
      result = processed.join("");
      linked.add(path);
    }
  }

  return result;
}

/** For legacy markdown content — converts first entity mention to a Markdown link [name](path) */
export function autoLinkMarkdown(text: string, entities: Entity[]): string {
  if (!text || entities.length === 0) return text;
  const sorted = [...entities].sort((a, b) => b.name.length - a.name.length);
  let result = text;
  const linked = new Set<string>();

  for (const { name, path } of sorted) {
    if (linked.has(path)) continue;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const next = result.replace(new RegExp(`\\b${escaped}\\b`, "i"), (match) => {
      linked.add(path);
      return `[${match}](${path})`;
    });
    if (next !== result) {
      result = next;
      linked.add(path);
    }
  }
  return result;
}
